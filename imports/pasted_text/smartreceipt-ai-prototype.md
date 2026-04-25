Create a high-fidelity clickable web application prototype for an AI-powered receipt scanning and expense categorization app.

Project name: SmartReceipt AI

The app is a modern SaaS-style web application where users can upload photos or scans of shopping receipts. The system uses AI OCR to extract receipt data such as store name, purchase date, total amount, currency, and receipt items. Then it automatically categorizes the expense into categories such as groceries, pharmacy, drugstore, transport, electronics, restaurant, clothing, and other. Users can review, edit, save, filter, and analyze their receipts.

Use a clean, modern, professional design. The app should feel simple, trustworthy, and easy to use. Use a light theme with soft gradients, rounded cards, subtle shadows, and a blue/violet/teal accent color palette. The interface should look suitable for a cloud-based AI finance tool.

Create the following desktop screens in 1440px width:

1. Landing Page
- Hero section with title: “Scan receipts. Track expenses. Understand your spending.”
- Subtitle explaining that users can upload receipts and AI will extract and categorize expenses automatically.
- Two buttons: “Create account” and “Sign in”
- A small visual mockup of a receipt and analytics dashboard.
- Section with 3 steps:
  1. Upload receipt
  2. AI extracts data
  3. Track your expenses
- Minimal footer.

2. Sign Up Page
- Centered registration card.
- Fields: Email, Password, Confirm password.
- Button: “Create account”
- Link: “Already have an account? Sign in”
- Simple friendly illustration or icon related to receipts.

3. Sign In Page
- Centered login card.
- Fields: Email and Password.
- Button: “Sign in”
- Link to registration page.
- Add subtle background gradient.

4. Main Dashboard
- Sidebar navigation with:
  Dashboard
  Upload Receipt
  Receipts
  Analytics
  Categories
  Profile
- Top bar with user avatar and greeting.
- Main title: “Dashboard”
- Statistic cards:
  Total spent this month: 234.80 €
  Receipts uploaded: 18
  Top category: Groceries
  Average receipt value: 13.04 €
- A donut chart showing spending by category.
- A line chart or bar chart showing spending over time.
- Section “Recent receipts” with 5 rows:
  Date, Store, Category, Total, Status.
- Primary button: “Upload new receipt”

5. Upload Receipt Page
- Sidebar layout.
- Large drag-and-drop upload area in the center.
- Text: “Drag & drop your receipt here”
- Secondary text: “Supported formats: JPG, PNG, PDF”
- Button: “Choose file”
- After file selection, show a preview card with:
  file name
  file size
  receipt image preview
  buttons: “Remove” and “Start scanning”
- Add a clean empty state illustration.

6. Processing Screen
- Show a loading/progress interface.
- Title: “Scanning your receipt...”
- Steps with progress indicators:
  Uploading file
  Reading receipt with AI
  Extracting important data
  Categorizing expense
  Preparing result
- Use checkmarks for completed steps and spinner for current step.
- Add small message: “This may take a few seconds.”

7. Review Extracted Data Page
- Two-column layout.
- Left side: large receipt image preview with zoom buttons.
- Right side: editable form with extracted data:
  Store name: Lidl
  Purchase date: 24.04.2026
  Total amount: 23.49
  Currency: EUR
  Category: Groceries
  Notes
- Add dropdown for category.
- Below the form, show extracted items table:
  Item, Quantity, Price
  Milk, 1, 1.29 €
  Bread, 1, 1.10 €
  Eggs, 1, 3.49 €
- Buttons:
  Save receipt
  Re-scan
  Delete
- Add a small warning/info box: “Please review the extracted data before saving.”

8. Receipts History Page
- Sidebar layout.
- Title: “Receipts”
- Search input: “Search by store or item”
- Filters:
  Date from
  Date to
  Category
  Status
  Min amount
  Max amount
- Receipts table with columns:
  Date
  Store
  Category
  Total
  Status
  Actions
- Use status badges:
  Completed
  Needs review
  Failed
  Processing
- Add rows with realistic data:
  Lidl, Groceries, 23.49 €
  DM, Drugstore, 11.99 €
  Dr. Max, Pharmacy, 8.70 €
  Alza, Electronics, 129.90 €
- Actions button: “View”

9. Receipt Detail Page
- Sidebar layout.
- Show detailed receipt information.
- Left side: original receipt image.
- Right side: receipt details card:
  Store
  Date
  Total
  Currency
  Category
  Status
  Created at
  Updated at
- Show items table.
- Add collapsible section: “Raw OCR text”
- Buttons:
  Edit
  Delete
  Re-scan
  Back to receipts

10. Analytics Page
- Sidebar layout.
- Title: “Analytics”
- Date range selector at the top.
- Statistic cards:
  Total spent
  Number of receipts
  Most expensive category
  Most visited store
- Donut chart: Spending by category.
- Bar chart: Monthly spending.
- Table: Top stores by total spending.
- Use realistic sample data.
- Make charts visually clean and readable.

11. Categories Page
- Sidebar layout.
- Title: “Categories”
- Grid of category cards:
  Groceries
  Drugstore
  Pharmacy
  Transport
  Electronics
  Restaurant
  Clothing
  Other
- Each category card should show:
  icon
  color indicator
  number of receipts
  total spent
- Add button: “Add category”, but make it secondary because custom categories are optional.

12. Profile Page
- Sidebar layout.
- User profile card with:
  email
  account created date
  default currency: EUR
- Button: “Log out”
- Simple settings section.

Prototype interactions:
- Landing page “Create account” goes to Sign Up.
- Landing page “Sign in” goes to Sign In.
- Successful sign in goes to Dashboard.
- “Upload new receipt” goes to Upload Receipt page.
- “Start scanning” goes to Processing screen.
- Processing screen goes to Review Extracted Data page.
- “Save receipt” goes to Receipts History page.
- “View” in receipts table goes to Receipt Detail page.
- Sidebar links navigate between main pages.

Design requirements:
- Use consistent spacing, typography, and components.
- Use rounded cards, modern buttons, clean tables, readable forms.
- Use icons for navigation and categories.
- Avoid clutter.
- Make the prototype look like a real product MVP, not just wireframes.
- Use English UI text.
- Use realistic sample receipt and expense data.