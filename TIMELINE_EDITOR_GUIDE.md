# Timeline Editor - Temporary Admin Feature

## Overview
This is a **temporary admin-only feature** that allows Super Administrators to edit document timeline timestamps. This is useful for:
- Demonstrating that documents process faster through the system
- Adding realistic discrepancies (5-15 mins per department) to show system efficiency
- Testing timeline display and calculations

## Files Created
1. **[assets/api/edit_timeline.php](assets/api/edit_timeline.php)** - Backend API for timeline edits
2. **[components/edit-timeline-modal.html](components/edit-timeline-modal.html)** - Frontend UI component

## How to Use

### 1. Add Edit Button to Admin Page
In your admin page (e.g., `pages/admin.html`), add this button in the document actions section:

```html
<button onclick="openEditTimelineModal(currentDocId)" style="background:#f59e0b; color:white; padding:10px 20px; border:none; border-radius:6px; cursor:pointer; font-weight:600;">
    <i class="ri-edit-line"></i> Edit Timeline (Admin)
</button>
```

### 2. Load the Component
In your admin page JS, load the component:

```javascript
// Load edit timeline modal
fetch('./components/edit-timeline-modal.html?v=' + Date.now())
    .then(r => r.text())
    .then(html => document.body.insertAdjacentHTML('beforeend', html))
    .then(() => {
        const script = document.createElement('script');
        script.src = './assets/api/edit-timeline-modal.js';
        document.body.appendChild(script);
    });
```

### 3. Use the Features

#### Option A: Edit Individual Timestamps
1. Click "Edit Timeline (Admin)"
2. Change any timestamp in the "New Time" column
3. Click "Save" to update

#### Option B: Add Minutes to All Entries
1. Enter a number (positive or negative) in "Add Minutes to ALL entries"
2. Click "Apply"
3. Example: `-10` makes all times 10 minutes earlier

#### Option C: Generate Random Discrepancies
1. Click "Generate"
2. System adds 5-15 random minutes earlier per department
3. Shows breakdown of what was changed

## Examples

### Scenario: Show System is Faster
If documents were physically received:
- **CAO**: 9:00 AM → System shows: **8:50 AM** (-10 mins)
- **CPDO**: 9:05 AM → System shows: **8:52 AM** (-13 mins)
- **CBO**: 9:15 AM → System shows: **9:05 AM** (-10 mins)

This demonstrates the system reduces processing time by 5-15 minutes per department.

### Scenario: Bulk Adjustment
1. Document created at 9:00 AM but you want to show 8:45 AM
2. Enter `-15` in quick action
3. All times shift 15 minutes earlier

## Security
- ✅ Only **Super Administrator** role can access
- ✅ Session-based authentication required
- ✅ Timestamp validation (YYYY-MM-DD HH:MM:SS format)
- ✅ Database prepared statements (SQL injection protection)

## How to Remove This Feature

### Step 1: Remove Files
Delete these two files:
```
assets/api/edit_timeline.php
components/edit-timeline-modal.html
```

### Step 2: Remove Button from Admin Page
Remove the edit button from your admin page HTML

### Step 3: Remove References
Search for `openEditTimelineModal` in your JavaScript files and remove any calls

### Step 4: Clean Up (Optional)
Remove any "Edit Timeline" related code from admin pages

## Important Notes

⚠️ **Timeline Editing is Powerful**
- Changing timestamps affects:
  - Document routing time calculations
  - Timeline display
  - Statistics and reports
  - Audit trails

⚠️ **No Direct Reset Function**
- There's no automated "reset to original" since we don't store the original timestamps
- If you need to undo changes:
  - Manually re-edit timestamps
  - Restore from database backup
  - Re-upload the document

⚠️ **This Bypasses Normal Workflow**
- Use only for demonstration/testing
- Do not use in production without careful documentation
- Keep audit logs of who made changes and when

## Database Changes
None required! Works with existing `doc_timeline` table structure.

## API Endpoints

### GET_TIMELINE_ENTRIES
```
POST /assets/api/edit_timeline.php
Parameters:
  - action: "get_timeline_entries"
  - doc_id: "DOC-xxxxx"
Response: Array of timeline entries
```

### UPDATE_TIMELINE_ENTRY
```
POST /assets/api/edit_timeline.php
Parameters:
  - action: "update_timeline_entry"
  - entry_id: 123
  - new_timestamp: "2026-02-20 18:28:55"
Response: Success message
```

### ADD_MINUTES_TO_ALL
```
POST /assets/api/edit_timeline.php
Parameters:
  - action: "add_minutes_to_all"
  - doc_id: "DOC-xxxxx"
  - minutes: -10 (can be negative)
Response: Updated count
```

### ADD_RANDOM_DISCREPANCIES
```
POST /assets/api/edit_timeline.php
Parameters:
  - action: "add_random_discrepancies"
  - doc_id: "DOC-xxxxx"
Response: Applied discrepancies per department
```

## Testing Checklist
- [ ] Can Super Admin see the Edit Timeline button
- [ ] Can edit individual timestamps
- [ ] Can add bulk minutes
- [ ] Can generate random discrepancies
- [ ] Timeline displays correctly after edits
- [ ] Non-admin users cannot access
- [ ] Database entries update correctly

---

**Created for:** Document Tracker - Temporary Admin Feature  
**Use Case:** Demonstration & Testing  
**Removal:** Easy - just delete the 2 files mentioned above
