from agents import Agent, Runner

from config import config, model
from sheets import get_due_reminders as read_due_reminders
from tools import get_due_reminders, get_summary


INSTRUCTIONS = (
    "You help school office staff with fee recovery. Use tool results for fee "
    "questions; never guess numbers. Reply in simple English or Roman Urdu, "
    "matching the user. For questions about reminders due, call "
    "get_due_reminders and list every student returned; do not omit rows or "
    "filter by stage. For dashboard questions, use get_summary. WhatsApp "
    "sending is not available yet: never claim a reminder was sent or promise "
    "that it will be sent."
)


def _is_due_reminder_question(user_input: str) -> bool:
    normalized = user_input.casefold()
    return "reminder" in normalized and "due" in normalized


def _format_due_reminders() -> str:
    reminders = read_due_reminders()
    if not reminders:
        return "Sheet ke mutabiq abhi koi reminder due nahin hai."

    lines = [
        f"Sheet mein {len(reminders)} students ke reminders due hain "
        "(send_now = YES):"
    ]
    for reminder in reminders:
        lines.append(
            f"- {reminder['student_name']} - {reminder['stage']}, "
            f"balance Rs. {reminder['balance']}"
        )
    return "\n".join(lines)


def create_agent() -> Agent:
    return Agent(
        name="Fee Recovery Assistant",
        instructions=INSTRUCTIONS,
        model=model,
        tools=[get_due_reminders, get_summary],
    )


def main() -> None:
    agent = create_agent()
    print("Fee Recovery Assistant ready. Type 'exit' to quit.")
    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye.")
            break
        if user_input.lower() in {"exit", "quit"}:
            break
        if not user_input:
            continue
        if _is_due_reminder_question(user_input):
            print(f"Assistant: {_format_due_reminders()}")
            continue

        result = Runner.run_sync(agent, user_input, run_config=config)
        print(f"Assistant: {result.final_output}")


if __name__ == "__main__":
    main()
