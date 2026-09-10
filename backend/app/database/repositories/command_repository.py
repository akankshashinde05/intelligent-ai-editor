"""
Intelligent AI Editor - Command History Repository
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.models import CommandHistory, RiskLevelEnum, ExecutionStatusEnum

class CommandRepository:
    @staticmethod
    async def create_log(
        session: AsyncSession,
        command: str,
        working_directory: str,
        shell_type: str = "powershell",
        raw_prompt: Optional[str] = None,
        explanation: Optional[str] = None,
        risk_level: RiskLevelEnum = RiskLevelEnum.LOW,
        status: ExecutionStatusEnum = ExecutionStatusEnum.SUCCESS,
        exit_code: Optional[int] = 0,
        stdout: Optional[str] = None,
        stderr: Optional[str] = None,
        execution_time_ms: Optional[float] = None
    ) -> CommandHistory:
        log = CommandHistory(
            raw_prompt=raw_prompt,
            synthesized_command=command,
            explanation=explanation,
            shell_type=shell_type,
            working_directory=working_directory,
            risk_level=risk_level,
            status=status,
            exit_code=exit_code,
            stdout=stdout,
            stderr=stderr,
            execution_time_ms=execution_time_ms
        )
        session.add(log)
        await session.commit()
        await session.refresh(log)
        return log

    @staticmethod
    async def get_recent_logs(session: AsyncSession, limit: int = 50) -> List[CommandHistory]:
        stmt = select(CommandHistory).order_by(desc(CommandHistory.created_at)).limit(limit)
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def clear_history(session: AsyncSession):
        stmt = select(CommandHistory)
        result = await session.execute(stmt)
        for item in result.scalars().all():
            await session.delete(item)
        await session.commit()

command_repository = CommandRepository()
