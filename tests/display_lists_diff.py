from typing import List, Tuple, Any, Dict, Optional
import sys


class Color:
    """ANSI color codes for terminal output"""

    # Basic colors
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"

    # Bright colors
    BRIGHT_RED = "\033[31;1m"
    BRIGHT_GREEN = "\033[32;1m"
    BRIGHT_YELLOW = "\033[33;1m"
    BRIGHT_BLUE = "\033[34;1m"

    # Background colors
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_YELLOW = "\033[43m"
    BG_BLUE = "\033[44m"

    # Styles
    BOLD = "\033[1m"
    DIM = "\033[2m"
    UNDERLINE = "\033[4m"
    BLINK = "\033[5m"
    REVERSE = "\033[7m"

    # Reset
    RESET = "\033[0m"

    # Color combinations for different change types
    DELETION = RED + BOLD
    INSERTION = GREEN + BOLD
    SUBSTITUTION_OLD = RED + BOLD
    SUBSTITUTION_NEW = GREEN + BOLD
    MATCH = DIM
    HIGHLIGHT = YELLOW + BOLD
    INFO = CYAN
    WARNING = YELLOW
    ERROR = RED + BOLD

    @staticmethod
    def colored(text: str, color_code: str) -> str:
        """Wrap text in color codes"""
        return f"{color_code}{text}{Color.RESET}"

    @staticmethod
    def disable() -> None:
        """Disable all colors (for non-terminal output)"""
        Color.RED = Color.GREEN = Color.YELLOW = Color.BLUE = ""
        Color.MAGENTA = Color.CYAN = Color.WHITE = ""
        Color.BRIGHT_RED = Color.BRIGHT_GREEN = Color.BRIGHT_YELLOW = (
            Color.BRIGHT_BLUE
        ) = ""
        Color.BG_RED = Color.BG_GREEN = Color.BG_YELLOW = Color.BG_BLUE = ""
        Color.BOLD = Color.DIM = Color.UNDERLINE = Color.BLINK = Color.REVERSE = ""
        Color.RESET = ""
        Color.DELETION = Color.INSERTION = Color.SUBSTITUTION_OLD = (
            Color.SUBSTITUTION_NEW
        ) = ""
        Color.MATCH = Color.HIGHLIGHT = Color.INFO = Color.WARNING = Color.ERROR = ""

    @staticmethod
    def enable() -> None:
        """Re-enable colors"""
        Color.__init__()


def list_diff_color(
    list1: List[Any],
    list2: List[Any],
    max_display_items: int = 10,
    truncate_length: int = 15,
    show_colors: bool = True,
    show_context: bool = True,
    context_before: int = 1,
    context_after: int = 1,
) -> Dict[str, any]:
    """
    Compare two lists and compute colored differences with edit distance.

    Args:
        list1: First list for comparison
        list2: Second list for comparison
        max_display_items: Maximum number of changed items to display in diff string
        truncate_length: Maximum length to display for each item in diff string
        show_colors: Whether to use color codes in output
        show_context: Whether to show context around changes
        context_before: Number of context items to show before change
        context_after: Number of context items to show after change

    Returns:
        Dictionary containing diff results
    """

    if not show_colors:
        Color.disable()

    def truncate_item(item: Any) -> str:
        """Truncate item for display."""
        s = str(item)
        if len(s) > truncate_length:
            return s[: truncate_length - 3] + "..."
        return s

    # Initialize DP table for edit distance
    m, n = len(list1), len(list2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # Initialize DP table
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    # Fill DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if list1[i - 1] == list2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(
                    dp[i - 1][j] + 1,  # deletion
                    dp[i][j - 1] + 1,  # insertion
                    dp[i - 1][j - 1] + 1,  # substitution
                )

    # Backtrack to find alignment
    i, j = m, n
    alignment = []
    mismatches = []
    changes_with_context = []

    while i > 0 or j > 0:
        if i > 0 and j > 0 and list1[i - 1] == list2[j - 1]:
            alignment.append(("match", i - 1, j - 1, list1[i - 1]))
            i -= 1
            j -= 1
        else:
            if i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
                # Substitution
                alignment.append(("sub", i - 1, j - 1, list1[i - 1], list2[j - 1]))
                mismatches.append(("sub", i - 1, j - 1))
                i -= 1
                j -= 1
            elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
                # Deletion
                alignment.append(("del", i - 1, None, list1[i - 1]))
                mismatches.append(("del", i - 1, None))
                i -= 1
            else:
                # Insertion
                alignment.append(("ins", None, j - 1, None, list2[j - 1]))
                mismatches.append(("ins", None, j - 1))
                j -= 1

    alignment.reverse()
    mismatches.reverse()
    edit_distance = dp[m][n]

    # Generate colored diff string with context
    def generate_colored_diff_string() -> Tuple[str, List[Tuple]]:
        """Generate colored diff string with optional context."""
        diff_parts = []
        colored_parts = []
        change_locations = []
        counter = 0

        # Convert alignment to list of operations with context markers
        for idx, op in enumerate(alignment):
            if op[0] == "match":
                if show_context:
                    # Check if this match is near a change
                    is_near_change = False
                    look_ahead = min(idx + context_after + 1, len(alignment))
                    look_behind = max(idx - context_before, 0)

                    for k in range(look_behind, look_ahead):
                        if k < len(alignment) and alignment[k][0] != "match":
                            is_near_change = True
                            break

                    if is_near_change and counter < max_display_items:
                        item_str = truncate_item(op[3])
                        diff_parts.append(item_str)
                        colored_parts.append(Color.colored(item_str, Color.MATCH))
                    elif not diff_parts or diff_parts[-1] != "...":
                        if len(diff_parts) < max_display_items and is_near_change:
                            item_str = truncate_item(op[3])
                            diff_parts.append(item_str)
                            colored_parts.append(Color.colored(item_str, Color.MATCH))
            elif op[0] == "sub":
                if counter < max_display_items:
                    old_val = truncate_item(op[3])
                    new_val = truncate_item(op[4])

                    # Add context before if needed
                    if show_context and idx > 0 and alignment[idx - 1][0] == "match":
                        prev_match = alignment[idx - 1]
                        prev_str = truncate_item(prev_match[3])
                        if prev_str not in diff_parts[-context_before:]:
                            diff_parts.append(prev_str)
                            colored_parts.append(Color.colored(prev_str, Color.MATCH))

                    # Add the substitution
                    diff_parts.append(f"-{old_val}")
                    diff_parts.append(f"+{new_val}")
                    colored_parts.append(
                        Color.colored(f"-{old_val}", Color.SUBSTITUTION_OLD)
                    )
                    colored_parts.append(
                        Color.colored(f"+{new_val}", Color.SUBSTITUTION_NEW)
                    )

                    change_locations.append(
                        ("sub", len(colored_parts) - 2, op[1], op[2])
                    )
                    counter += 1

                    # Add context after if needed
                    if (
                        show_context
                        and idx + 1 < len(alignment)
                        and alignment[idx + 1][0] == "match"
                    ):
                        next_match = alignment[idx + 1]
                        next_str = truncate_item(next_match[3])
                        if next_str not in diff_parts:
                            diff_parts.append(next_str)
                            colored_parts.append(Color.colored(next_str, Color.MATCH))

                elif counter == max_display_items:
                    diff_parts.append("...")
                    colored_parts.append(Color.colored("...", Color.WARNING))
                    counter += 1

            elif op[0] == "del":
                if counter < max_display_items:
                    # Add context before if needed
                    if show_context and idx > 0 and alignment[idx - 1][0] == "match":
                        prev_match = alignment[idx - 1]
                        prev_str = truncate_item(prev_match[3])
                        if prev_str not in diff_parts[-context_before:]:
                            diff_parts.append(prev_str)
                            colored_parts.append(Color.colored(prev_str, Color.MATCH))

                    # Add the deletion
                    item_str = truncate_item(op[3])
                    diff_parts.append(f"-{item_str}")
                    colored_parts.append(Color.colored(f"-{item_str}", Color.DELETION))

                    change_locations.append(
                        ("del", len(colored_parts) - 1, op[1], None)
                    )
                    counter += 1

                    # Add context after if needed
                    if (
                        show_context
                        and idx + 1 < len(alignment)
                        and alignment[idx + 1][0] == "match"
                    ):
                        next_match = alignment[idx + 1]
                        next_str = truncate_item(next_match[3])
                        if next_str not in diff_parts:
                            diff_parts.append(next_str)
                            colored_parts.append(Color.colored(next_str, Color.MATCH))

                elif counter == max_display_items:
                    diff_parts.append("...")
                    colored_parts.append(Color.colored("...", Color.WARNING))
                    counter += 1

            elif op[0] == "ins":
                if counter < max_display_items:
                    # Add context before if needed
                    if show_context and idx > 0 and alignment[idx - 1][0] == "match":
                        prev_match = alignment[idx - 1]
                        prev_str = truncate_item(prev_match[3])
                        if prev_str not in diff_parts[-context_before:]:
                            diff_parts.append(prev_str)
                            colored_parts.append(Color.colored(prev_str, Color.MATCH))

                    # Add the insertion
                    item_str = truncate_item(op[4])
                    diff_parts.append(f"+{item_str}")
                    colored_parts.append(Color.colored(f"+{item_str}", Color.INSERTION))

                    change_locations.append(
                        ("ins", len(colored_parts) - 1, None, op[2])
                    )
                    counter += 1

                    # Add context after if needed
                    if (
                        show_context
                        and idx + 1 < len(alignment)
                        and alignment[idx + 1][0] == "match"
                    ):
                        next_match = alignment[idx + 1]
                        next_str = truncate_item(next_match[3])
                        if next_str not in diff_parts:
                            diff_parts.append(next_str)
                            colored_parts.append(Color.colored(next_str, Color.MATCH))

                elif counter == max_display_items:
                    diff_parts.append("...")
                    colored_parts.append(Color.colored("...", Color.WARNING))
                    counter += 1

        # Build the final strings
        plain_string = " ".join(diff_parts)
        colored_string = " ".join(colored_parts)

        return colored_string, change_locations

    colored_diff_string, change_locations = generate_colored_diff_string()

    # Format mismatches with colors
    formatted_mismatches = []
    for mismatch in mismatches:
        if mismatch[0] == "sub":
            old_item = (
                truncate_item(list1[mismatch[1]]) if mismatch[1] < len(list1) else "N/A"
            )
            new_item = (
                truncate_item(list2[mismatch[2]]) if mismatch[2] < len(list2) else "N/A"
            )
            colored_mismatch = (
                f"{Color.colored('list1', Color.INFO)}[{Color.colored(mismatch[1], Color.HIGHLIGHT)}]: "
                f"{Color.colored(old_item, Color.SUBSTITUTION_OLD)} → "
                f"{Color.colored('list2', Color.INFO)}[{Color.colored(mismatch[2], Color.HIGHLIGHT)}]: "
                f"{Color.colored(new_item, Color.SUBSTITUTION_NEW)}"
            )
            formatted_mismatches.append(colored_mismatch)
        elif mismatch[0] == "del":
            item = (
                truncate_item(list1[mismatch[1]]) if mismatch[1] < len(list1) else "N/A"
            )
            colored_mismatch = (
                f"{Color.colored('list1', Color.INFO)}[{Color.colored(mismatch[1], Color.HIGHLIGHT)}]: "
                f"{Color.colored(item, Color.DELETION)} {Color.colored('deleted', Color.WARNING)}"
            )
            formatted_mismatches.append(colored_mismatch)
        elif mismatch[0] == "ins":
            item = (
                truncate_item(list2[mismatch[2]]) if mismatch[2] < len(list2) else "N/A"
            )
            colored_mismatch = (
                f"{Color.colored('list2', Color.INFO)}[{Color.colored(mismatch[2], Color.HIGHLIGHT)}]: "
                f"{Color.colored(item, Color.INSERTION)} {Color.colored('inserted', Color.WARNING)}"
            )
            formatted_mismatches.append(colored_mismatch)

    # Create a summary line with colored indicators
    summary_colors = {
        "match": Color.colored("█", Color.MATCH),
        "del": Color.colored("█", Color.DELETION),
        "ins": Color.colored("█", Color.INSERTION),
        "sub": Color.colored("█", Color.SUBSTITUTION_OLD)
        + Color.colored("█", Color.SUBSTITUTION_NEW),
    }

    visual_summary = []
    for op in alignment:
        if op[0] in summary_colors:
            visual_summary.append(summary_colors[op[0]])

    # Create a compact visual diff
    visual_diff = "".join(visual_summary[:100])  # Limit to first 100 chars

    return {
        "edit_distance": edit_distance,
        "diff_string": colored_diff_string,
        "plain_diff_string": colored_diff_string.replace("\033[", "")
        .replace("m", "")
        .replace("[0", ""),
        "mismatches": formatted_mismatches,
        "alignment": alignment,
        "mismatch_count": len(mismatches),
        "visual_summary": visual_diff,
        "change_locations": change_locations,
    }


def print_colored_diff_summary(
    list1: List[Any],
    list2: List[Any],
    title: str = "List Comparison",
    show_legend: bool = True,
    **kwargs,
) -> None:
    """
    Print a formatted, colored summary of differences between two lists.

    Args:
        list1: First list for comparison
        list2: Second list for comparison
        title: Title for the comparison
        show_legend: Whether to show the color legend
        **kwargs: Additional arguments passed to list_diff_color
    """
    result = list_diff_color(list1, list2, **kwargs)

    # Print title
    print(f"\n{Color.colored('═' * 60, Color.INFO)}")
    print(f"{Color.colored(title, Color.BOLD + Color.UNDERLINE + Color.CYAN)}")
    print(f"{Color.colored('═' * 60, Color.INFO)}")

    # Print summary stats
    print(f"\n{Color.colored('📊 Summary:', Color.BOLD + Color.BLUE)}")
    print(
        f"  {Color.colored('•', Color.INFO)} List1 length: {Color.colored(len(list1), Color.HIGHLIGHT)}"
    )
    print(
        f"  {Color.colored('•', Color.INFO)} List2 length: {Color.colored(len(list2), Color.HIGHLIGHT)}"
    )
    print(
        f"  {Color.colored('•', Color.INFO)} Minimum Edit Distance: {Color.colored(result['edit_distance'], Color.HIGHLIGHT)}"
    )
    print(
        f"  {Color.colored('•', Color.INFO)} Total changes: {Color.colored(result['mismatch_count'], Color.HIGHLIGHT)}"
    )

    # Print visual summary if not too long
    if len(result["visual_summary"]) <= 100:
        print(f"\n{Color.colored('👁 Visual Summary:', Color.BOLD + Color.BLUE)}")
        print(f"  {result['visual_summary']}")

    # Print legend
    if show_legend:
        print(f"\n{Color.colored('📖 Legend:', Color.BOLD + Color.BLUE)}")
        print(f"  {Color.colored('-item', Color.DELETION)} : Deletion from list1")
        print(f"  {Color.colored('+item', Color.INSERTION)} : Insertion in list2")
        print(
            f"  {Color.colored('-old', Color.SUBSTITUTION_OLD)} {Color.colored('+new', Color.SUBSTITUTION_NEW)} : Substitution (old→new)"
        )
        print(f"  {Color.colored('item', Color.MATCH)} : Matching item (context)")
        print(f"  {Color.colored('...', Color.WARNING)} : Additional changes not shown")

    # Print single-line diff
    print(f"\n{Color.colored('🔍 Changes:', Color.BOLD + Color.BLUE)}")
    print(f"  {result['diff_string']}")

    # Print mismatch details (limited)
    if result["mismatches"]:
        print(
            f"\n{Color.colored('📝 Detailed Changes (first 15):', Color.BOLD + Color.BLUE)}"
        )
        for i, mismatch in enumerate(result["mismatches"][:15]):
            print(f"  {Color.colored(f'{i + 1:2d}.', Color.DIM)} {mismatch}")
        if len(result["mismatches"]) > 15:
            print(
                f"  {Color.colored('...', Color.WARNING)} and {Color.colored(len(result['mismatches']) - 15, Color.HIGHLIGHT)} more changes"
            )

    # Print alignment type counts
    if "alignment" in result:
        counts = {"match": 0, "del": 0, "ins": 0, "sub": 0}
        for op in result["alignment"]:
            counts[op[0]] += 1

        print(f"\n{Color.colored('📈 Alignment Statistics:', Color.BOLD + Color.BLUE)}")
        print(
            f"  {Color.colored('•', Color.INFO)} Matches: {Color.colored(counts['match'], Color.MATCH.replace(Color.BOLD, ''))}"
        )
        print(
            f"  {Color.colored('•', Color.INFO)} Deletions: {Color.colored(counts['del'], Color.DELETION.replace(Color.BOLD, ''))}"
        )
        print(
            f"  {Color.colored('•', Color.INFO)} Insertions: {Color.colored(counts['ins'], Color.INSERTION.replace(Color.BOLD, ''))}"
        )
        print(
            f"  {Color.colored('•', Color.INFO)} Substitutions: {Color.colored(counts['sub'], Color.SUBSTITUTION_OLD.replace(Color.BOLD, ''))}"
        )

    print(f"\n{Color.colored('═' * 60, Color.INFO)}\n")


def create_side_by_side_view(
    list1: List[Any], list2: List[Any], result: Dict[str, any], max_lines: int = 20
) -> str:
    """
    Create a side-by-side colored view of the differences.
    """
    output_lines = []
    output_lines.append(
        f"\n{Color.colored('SIDE-BY-SIDE COMPARISON', Color.BOLD + Color.UNDERLINE + Color.CYAN)}"
    )
    output_lines.append(
        f"{Color.colored('list1', Color.INFO):<40} | {Color.colored('list2', Color.INFO)}"
    )
    output_lines.append(f"{'-' * 40}-+-{'-' * 40}")

    alignment = result.get("alignment", [])

    for i, op in enumerate(alignment[:max_lines]):
        if op[0] == "match":
            item = str(op[3])[:35]
            left = f"{Color.colored('✓', Color.MATCH)} {Color.colored(item, Color.MATCH):<38}"
            right = (
                f"{Color.colored('✓', Color.MATCH)} {Color.colored(item, Color.MATCH)}"
            )
        elif op[0] == "del":
            item = str(op[3])[:35]
            left = f"{Color.colored('✗', Color.DELETION)} {Color.colored(item, Color.DELETION):<38}"
            right = f"{Color.colored(' ', Color.RESET):<40}"
        elif op[0] == "ins":
            item = str(op[4])[:35]
            left = f"{Color.colored(' ', Color.RESET):<40}"
            right = f"{Color.colored('+', Color.INSERTION)} {Color.colored(item, Color.INSERTION)}"
        elif op[0] == "sub":
            old_item = str(op[3])[:35]
            new_item = str(op[4])[:35]
            left = f"{Color.colored('→', Color.SUBSTITUTION_OLD)} {Color.colored(old_item, Color.SUBSTITUTION_OLD):<38}"
            right = f"{Color.colored('→', Color.SUBSTITUTION_NEW)} {Color.colored(new_item, Color.SUBSTITUTION_NEW)}"

        output_lines.append(f"{left} | {right}")

    if len(alignment) > max_lines:
        output_lines.append(
            f"{Color.colored('...', Color.WARNING):<40} | {Color.colored('...', Color.WARNING)}"
        )

    return "\n".join(output_lines)


# Example usage and test cases
if __name__ == "__main__":
    # Test case 1: Simple colored example
    print("Test Case 1: Simple lists with colors")
    list_a = ["apple", "banana", "cherry", "date", "fig", "grape"]
    list_b = ["apple", "blueberry", "cherry", "elderberry", "fig", "grapefruit"]
    print_colored_diff_summary(list_a, list_b, title="Fruit List Comparison")

    # Show side-by-side view
    result = list_diff_color(list_a, list_b, show_context=True)
    print(create_side_by_side_view(list_a, list_b, result, max_lines=10))

    # Test case 2: Longer lists
    print("\nTest Case 2: Longer lists with modifications")
    long_list1 = [f"item_{i:03d}" for i in range(50)]
    long_list2 = long_list1.copy()
    # Introduce changes
    long_list2[5] = "changed_005"
    long_list2[15] = "new_item_015"
    del long_list2[25]
    long_list2.insert(30, "inserted_030")
    long_list2[42] = "modified_042"

    print_colored_diff_summary(
        long_list1,
        long_list2,
        title="Long List Comparison",
        max_display_items=12,
        show_context=True,
    )

    # Test case 3: Numbers and mixed types
    print("\nTest Case 3: Numbers and mixed data types")
    data1 = [1, 2, 3, "four", 5.0, (6, 7), "eight", 9, 10]
    data2 = [1, 2, 3, 4, 5.0, (6, 7), "ate", 9, 10, 11]

    print_colored_diff_summary(
        data1, data2, title="Mixed Data Types Comparison", truncate_length=20
    )

    # Test case 4: Performance with very long lists
    print("\nTest Case 4: Performance with 300-item lists")
    import random

    random.seed(42)

    # Generate two long lists with some differences
    base_list = [f"data_point_{random.randint(1000, 9999)}" for _ in range(300)]
    modified_list = base_list.copy()

    # Introduce 25 random changes
    change_indices = random.sample(range(300), 25)
    for idx in change_indices[:15]:
        modified_list[idx] = f"modified_{random.randint(10000, 20000)}"
    for idx in change_indices[15:20]:
        if idx < len(modified_list):
            modified_list[idx] = f"new_value_{random.randint(20000, 30000)}"
    for idx in change_indices[20:]:
        if idx < len(modified_list) - 1:
            # Insert some items
            modified_list.insert(idx, f"inserted_{random.randint(30000, 40000)}")

    # Trim if needed to keep reasonable length
    if len(modified_list) > 320:
        modified_list = modified_list[:320]

    print_colored_diff_summary(
        base_list,
        modified_list,
        title="300-Item List Performance Test",
        max_display_items=15,
        show_context=False,
    )

    # Test case 5: Disable colors
    print("\nTest Case 5: Without colors")
    Color.disable()
    list_x = ["one", "two", "three"]
    list_y = ["one", "too", "three", "four"]
    print_colored_diff_summary(
        list_x, list_y, title="No Colors Test", show_colors=False
    )
    Color.enable()  # Re-enable colors for other tests


def batch_compare_multiple_lists(
    list_pairs: List[Tuple[List[Any], List[Any], str]], **kwargs
) -> None:
    """
    Compare multiple list pairs in batch.

    Args:
        list_pairs: List of tuples (list1, list2, description)
        **kwargs: Additional arguments for print_colored_diff_summary
    """
    print(f"\n{Color.colored('=' * 70, Color.BOLD + Color.CYAN)}")
    print(
        f"{Color.colored('BATCH COMPARISON', Color.BOLD + Color.UNDERLINE + Color.CYAN)}"
    )
    print(f"{Color.colored('=' * 70, Color.BOLD + Color.CYAN)}")

    for i, (list1, list2, description) in enumerate(list_pairs, 1):
        print(
            f"\n{Color.colored(f'Comparison {i}: {description}', Color.BOLD + Color.BLUE)}"
        )
        print_colored_diff_summary(list1, list2, **kwargs)


# Additional utility functions
def get_change_statistics(result: Dict[str, any]) -> Dict[str, int]:
    """Extract statistics from diff result."""
    if "alignment" not in result:
        return {}

    counts = {"matches": 0, "deletions": 0, "insertions": 0, "substitutions": 0}
    for op in result["alignment"]:
        if op[0] == "match":
            counts["matches"] += 1
        elif op[0] == "del":
            counts["deletions"] += 1
        elif op[0] == "ins":
            counts["insertions"] += 1
        elif op[0] == "sub":
            counts["substitutions"] += 1

    counts["total_changes"] = (
        counts["deletions"] + counts["insertions"] + counts["substitutions"]
    )
    counts["similarity_percentage"] = (
        round(counts["matches"] / len(result["alignment"]) * 100, 2)
        if result["alignment"]
        else 0
    )

    return counts


def highlight_changes_in_text(
    list1: List[Any], list2: List[Any], result: Dict[str, any]
) -> str:
    """
    Create a text highlighting changes with background colors.
    """
    output = []

    # Header
    output.append(
        f"{Color.colored('CHANGE HIGHLIGHTS', Color.BOLD + Color.UNDERLINE + Color.CYAN)}"
    )

    # Process each change location
    for change_type, str_pos, idx1, idx2 in result.get("change_locations", []):
        if change_type == "del":
            if idx1 is not None and idx1 < len(list1):
                item = str(list1[idx1])[:50]
                output.append(
                    f"  {Color.colored('DELETED:', Color.BOLD + Color.RED)} "
                    f"{Color.colored(item, Color.BG_RED + Color.WHITE)} "
                    f"(index {idx1})"
                )
        elif change_type == "ins":
            if idx2 is not None and idx2 < len(list2):
                item = str(list2[idx2])[:50]
                output.append(
                    f"  {Color.colored('INSERTED:', Color.BOLD + Color.GREEN)} "
                    f"{Color.colored(item, Color.BG_GREEN + Color.WHITE)} "
                    f"(index {idx2})"
                )
        elif change_type == "sub":
            if (
                idx1 is not None
                and idx1 < len(list1)
                and idx2 is not None
                and idx2 < len(list2)
            ):
                old_item = str(list1[idx1])[:30]
                new_item = str(list2[idx2])[:30]
                output.append(
                    f"  {Color.colored('CHANGED:', Color.BOLD + Color.YELLOW)} "
                    f"{Color.colored(old_item, Color.BG_RED + Color.WHITE)} "
                    f"{Color.colored('→', Color.YELLOW)} "
                    f"{Color.colored(new_item, Color.BG_GREEN + Color.WHITE)} "
                    f"(index {idx1}→{idx2})"
                )

    return "\n".join(output)

