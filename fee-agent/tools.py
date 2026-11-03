from agents import function_tool

from sheets import get_due_reminders as read_due_reminders
from sheets import get_summary as read_summary


@function_tool
def get_due_reminders() -> list[dict[str, object]]:
    """Read reminder candidates currently marked YES in the Fees sheet."""
    return read_due_reminders()


@function_tool
def get_summary() -> dict[str, str]:
    """Read fee totals and collection metrics from the Dashboard sheet."""
    return read_summary()
