"""
Intelligent AI Editor - Terminal Endpoints & WebSocket Session
Supports bidirectional WebSocket streaming, real Windows process execution, and command auditing.
"""
import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.terminal.command_executor import command_executor
from app.terminal.windows_shell import WindowsShellFactory, ShellAdapter
from app.terminal.shell_detector import shell_detector
from app.schemas.terminal import CommandExecutionRequest, CommandExecutionResponse
from app.schemas.common import BaseResponse
from app.database.repositories.command_repository import command_repository
from app.core.logging import logger

router = APIRouter(prefix="/terminal", tags=["Terminal Engine"])

@router.post("/execute", response_model=BaseResponse[CommandExecutionResponse])
async def execute_command(req: CommandExecutionRequest, db: AsyncSession = Depends(get_db)):
    try:
        exec_res = await command_executor.execute_command_stream(req)
        
        # Persist audit record in SQLite
        await command_repository.create_log(
            session=db,
            command=exec_res.command,
            working_directory=exec_res.working_directory,
            shell_type=exec_res.shell_type,
            raw_prompt=req.raw_prompt,
            risk_level=exec_res.risk_level,
            status=exec_res.status,
            exit_code=exec_res.exit_code,
            stdout=exec_res.stdout,
            stderr=exec_res.stderr,
            execution_time_ms=exec_res.execution_time_ms
        )

        return BaseResponse(success=True, data=exec_res)
    except Exception as e:
        logger.error(f"Execution endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream")
async def stream_command(
    command: str = Query(..., description="Command to execute"),
    shell: str = Query("powershell", description="Target shell"),
    cwd: str = Query(".", description="Working directory")
):
    """Server-Sent Events (SSE) streaming endpoint for command execution."""
    async def event_generator():
        req = CommandExecutionRequest(
            command=command,
            shell_type=shell,
            working_directory=cwd
        )
        
        queue = asyncio.Queue()

        def stream_cb(stream_type: str, data: str):
            queue.put_nowait({"type": stream_type, "data": data})

        task = asyncio.create_task(command_executor.execute_command_stream(req, output_callback=stream_cb))

        while not task.done() or not queue.empty():
            try:
                item = await asyncio.wait_for(queue.get(), timeout=0.1)
                yield f"data: {json.dumps(item)}\n\n"
            except asyncio.TimeoutError:
                continue

        res = await task
        yield f"data: {json.dumps({'type': 'exit', 'exit_code': res.exit_code, 'duration_ms': res.execution_time_ms})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.websocket("/session")
async def terminal_websocket_session(websocket: WebSocket):
    """
    WebSocket endpoint for real-time bidirectional terminal interaction with Windows PowerShell/CMD.
    Protocol:
      Client -> Server:
        { "action": "START", "shell": "powershell"|"cmd", "cwd": "C:\\..." }
        { "action": "INPUT", "data": "Get-ChildItem\\r\\n" }
        { "action": "INTERRUPT" }  (Ctrl+C)
        { "action": "RESIZE", "cols": 80, "rows": 24 }
        { "action": "CLOSE" }
      Server -> Client:
        { "type": "STATUS", "status": "CONNECTED", "shell": "...", "cwd": "..." }
        { "type": "OUTPUT", "data": "..." }
        { "type": "ERROR", "data": "..." }
        { "type": "EXIT", "exit_code": 0 }
    """
    await websocket.accept()
    shell_adapter: ShellAdapter = WindowsShellFactory.create_adapter("powershell")
    is_active = True

    await websocket.send_json({
        "type": "STATUS",
        "status": "READY",
        "cwd": shell_adapter.get_cwd(),
        "message": "Connected to Native Windows Terminal Engine"
    })

    async def send_output(stream_type: str, data: str):
        if is_active:
            try:
                msg_type = "ERROR" if stream_type == "stderr" else "OUTPUT"
                await websocket.send_json({"type": msg_type, "data": data})
            except Exception as e:
                logger.warning(f"WS send error: {e}")

    try:
        while is_active:
            raw_text = await websocket.receive_text()
            try:
                msg = json.loads(raw_text)
            except Exception:
                msg = {"action": "INPUT", "data": raw_text}

            action = msg.get("action", "").upper()

            if action == "START":
                shell_type = msg.get("shell", "powershell")
                cwd = msg.get("cwd", ".")
                shell_adapter = WindowsShellFactory.create_adapter(shell_type)
                await shell_adapter.start(cwd=cwd)
                await websocket.send_json({
                    "type": "STATUS",
                    "status": "STARTED",
                    "shell": shell_type,
                    "cwd": shell_adapter.get_cwd()
                })

            elif action == "INPUT":
                cmd_data = msg.get("data", "")
                if cmd_data.strip():
                    req = CommandExecutionRequest(
                        command=cmd_data.strip(),
                        shell_type=shell_adapter.shell_type if hasattr(shell_adapter, 'shell_type') else "powershell",
                        working_directory=shell_adapter.get_cwd()
                    )
                    res = await command_executor.execute_command_stream(
                        req,
                        output_callback=lambda st, d: asyncio.create_task(send_output(st, d))
                    )
                    await websocket.send_json({
                        "type": "EXIT",
                        "exit_code": res.exit_code,
                        "cwd": res.working_directory,
                        "duration_ms": res.execution_time_ms
                    })

            elif action == "INTERRUPT":
                await shell_adapter.interrupt()
                await websocket.send_json({
                    "type": "STATUS",
                    "status": "INTERRUPTED",
                    "message": "Received SIGINT / Ctrl+C signal"
                })

            elif action == "RESIZE":
                cols = msg.get("cols", 80)
                rows = msg.get("rows", 24)
                await shell_adapter.resize(cols, rows)

            elif action == "CLOSE":
                await shell_adapter.close()
                is_active = False
                break

    except WebSocketDisconnect:
        logger.info("Terminal WebSocket client disconnected.")
    except Exception as err:
        logger.error(f"Terminal WebSocket error: {err}")
    finally:
        await shell_adapter.close()

@router.get("/shells")
async def get_shells():
    shells = shell_detector.get_available_shells()
    return BaseResponse(success=True, data=shells)

@router.get("/history")
async def get_command_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    logs = await command_repository.get_recent_logs(db, limit=limit)
    return BaseResponse(success=True, data=logs)

@router.delete("/history")
async def clear_history(db: AsyncSession = Depends(get_db)):
    await command_repository.clear_history(db)
    return BaseResponse(success=True, message="History cleared successfully.")
