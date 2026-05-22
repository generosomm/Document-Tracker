# Document Routing Fix for Repeated Departments

## Problem
When a routing sequence contains the same department multiple times (e.g., CAO as 1st step and CAO as 5th step), the system was unable to properly route documents through repeated departments. The old `findIdx()` function always returned the **first occurrence** of a department, causing routing to get stuck or skip sequences.

## Solution
Implemented a new `findNextIdx()` function that intelligently tracks which occurrence of a department the document is currently at by counting how many times the document has been transferred to that department.

## Changes Made

### 1. New Helper Function: `findNextIdx()`
**Location:** [transfer_document.php](assets/api/transfer_document.php#L162-L205)

This function:
- Finds all positions where a department appears in the routing sequence
- Counts transfers to the current department from the timeline
- Uses the transfer count to determine which occurrence to use next
- Handles repeated departments by tracking visit history

**Logic:**
- Transfer Count 0 = First visit → Use 1st occurrence
- Transfer Count 1 = Second visit → Use 2nd occurrence  
- Transfer Count N = Nth visit → Use (N+1)th occurrence
- Once all occurrences are visited, stays at the last one

### 2. Updated Transfer Logic
**Location:** [transfer_document.php](assets/api/transfer_document.php#L451-L506)

Changes:
- Replaced `findIdx()` with `findNextIdx()` to determine current position
- Improved progress calculation: `(idx + 2) / sequence.length * 100` for more accuracy
- Now properly advances to the next occurrence instead of cycling back

### 3. Updated Route Info Display
**Location:** [transfer_document.php](assets/api/transfer_document.php#L687-L705)

Changes:
- Uses `findNextIdx()` to get the correct visual position on the progress bar
- Properly shows which step the document is at, even with repeated departments

### 4. Updated Status Change Logic
**Location:** [transfer_document.php](assets/api/transfer_document.php#L508-L537)

Changes:
- Uses `findNextIdx()` for progress calculation when updating to "In Progress"
- Ensures accurate progress tracking with repeated departments

## Example Scenario

**Routing Sequence:** CAO (1st) → CBO → CTO → CAO (5th) → OCM

**Before Fix:**
1. Document starts at CAO (position 0)
2. CAO transfers to CBO (position 1) ✓
3. CBO transfers to CTO (position 2) ✓
4. CTO tries to transfer → System finds CAO at position 0, stays stuck ✗

**After Fix:**
1. Document starts at CAO (position 0, transfer_count = 0)
2. CAO transfers to CBO (position 1, transfer_count = 1) ✓
3. CBO transfers to CTO (position 2, transfer_count = 2) ✓
4. CTO transfers to CAO (position 3, transfer_count = 3)
   - `findNextIdx()` finds both CAO positions: [0, 3]
   - Uses transfer_count (1st return to CAO) → Uses position 3 ✓
5. CAO (2nd visit) transfers to OCM (position 4) ✓

## Database Changes Required
None - The solution uses existing `doc_timeline` records to track transfers.

## Testing
To test with repeated departments:
1. Create a custom routing sequence with repeated departments
2. Route a test document through all steps
3. Verify the progress bar advances correctly
4. Confirm the document reaches all occurrences in order

## Files Modified
- [assets/api/transfer_document.php](assets/api/transfer_document.php)
