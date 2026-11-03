import os
import unittest
from unittest.mock import Mock, patch


os.environ.setdefault("GEMINI_API_KEY", "unit-test-key")

from agent import (  # noqa: E402
    _format_due_reminders,
    _is_due_reminder_question,
)
from sheets import get_due_reminders, get_summary  # noqa: E402


class SheetsTests(unittest.TestCase):
    def test_due_reminders_returns_only_exact_yes_rows(self) -> None:
        rows = [
            {
                "fee_id": "fee-yes",
                "student_name": "Student Yes",
                "parent_whatsapp": "+923000000001",
                "stage": "Overdue",
                "balance": 5000,
                "send_now": "YES",
            },
            {
                "fee_id": "fee-no",
                "student_name": "Student No",
                "parent_whatsapp": "+923000000002",
                "stage": "Due Today",
                "balance": 1000,
                "send_now": "NO",
            },
            {
                "fee_id": "fee-lowercase",
                "student_name": "Student Lowercase",
                "parent_whatsapp": "+923000000003",
                "stage": "Before Due",
                "balance": 2000,
                "send_now": "yes",
            },
        ]
        spreadsheet = Mock()
        spreadsheet.worksheet.return_value.get_all_records.return_value = rows

        with patch("sheets._get_spreadsheet", return_value=spreadsheet):
            reminders = get_due_reminders()

        self.assertEqual(
            reminders,
            [
                {
                    "fee_id": "fee-yes",
                    "student_name": "Student Yes",
                    "to": "+923000000001",
                    "stage": "Overdue",
                    "balance": 5000,
                }
            ],
        )
        spreadsheet.worksheet.assert_called_once_with("Fees")

    def test_due_reminders_returns_empty_list_when_none_are_yes(self) -> None:
        spreadsheet = Mock()
        spreadsheet.worksheet.return_value.get_all_records.return_value = [
            {"fee_id": "fee-no", "send_now": "NO"}
        ]

        with patch("sheets._get_spreadsheet", return_value=spreadsheet):
            self.assertEqual(get_due_reminders(), [])

    def test_summary_reads_the_dashboard_metrics(self) -> None:
        dashboard = [
            ["Fees billed (Rs.)", "60,500"],
            ["Fees collected (Rs.)", "21,500"],
            ["Fees pending (Rs.)", "39,000"],
            ["Collection rate", "35.5%"],
            ["Overdue balance (Rs.)", "23,500"],
            ["Defaulters (overdue)", "5"],
        ]
        spreadsheet = Mock()
        spreadsheet.worksheet.return_value.get_all_values.return_value = dashboard

        with patch("sheets._get_spreadsheet", return_value=spreadsheet):
            summary = get_summary()

        self.assertEqual(
            summary,
            {
                "billed": "60,500",
                "collected": "21,500",
                "pending": "39,000",
                "collection_rate": "35.5%",
                "overdue": "23,500",
                "defaulters": "5",
            },
        )
        spreadsheet.worksheet.assert_called_once_with("Dashboard")

    def test_summary_reports_missing_dashboard_metrics(self) -> None:
        spreadsheet = Mock()
        spreadsheet.worksheet.return_value.get_all_values.return_value = [
            ["Fees billed (Rs.)", "60,500"]
        ]

        with patch("sheets._get_spreadsheet", return_value=spreadsheet):
            with self.assertRaisesRegex(RuntimeError, "Dashboard is missing required metrics"):
                get_summary()


class ReminderQuestionTests(unittest.TestCase):
    def test_due_reminder_question_is_routed_to_sheet_formatter(self) -> None:
        self.assertTrue(_is_due_reminder_question("Aaj kin students ke reminders due hain?"))
        self.assertFalse(_is_due_reminder_question("Dashboard ke key numbers batao"))

    def test_formatter_lists_every_sheet_reminder(self) -> None:
        reminders = [
            {
                "student_name": "Student One",
                "stage": "Before Due",
                "balance": 5000,
            },
            {
                "student_name": "Student Two",
                "stage": "Overdue",
                "balance": 2500,
            },
        ]

        with patch("agent.read_due_reminders", return_value=reminders):
            answer = _format_due_reminders()

        self.assertIn("2 students", answer)
        for reminder in reminders:
            self.assertIn(reminder["student_name"], answer)
            self.assertIn(reminder["stage"], answer)
            self.assertIn(str(reminder["balance"]), answer)
        self.assertEqual(answer.count("\n- "), 2)

    def test_formatter_reports_when_there_are_no_reminders(self) -> None:
        with patch("agent.read_due_reminders", return_value=[]):
            answer = _format_due_reminders()

        self.assertIn("koi reminder due nahin", answer)


if __name__ == "__main__":
    unittest.main()
