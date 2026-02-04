from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Mobile viewport to bypass MobileExperienceWarning
    context = browser.new_context(viewport={'width': 375, 'height': 812})
    page = context.new_page()

    base_url = "http://localhost:5173"

    print("Verifying Exercise Form...")
    page.goto(f"{base_url}/#/exercises/new")
    # Exercise Title is the label in Form.Input
    page.wait_for_selector("text=Exercise Title")
    page.screenshot(path="verification/exercise_form.png")
    print("Exercise Form screenshot taken.")

    print("Verifying Routine Builder...")
    page.goto(f"{base_url}/#/builder/new")
    # Use placeholder locator
    page.get_by_placeholder("Routine Name").wait_for()
    page.screenshot(path="verification/routine_form.png")
    print("Routine Builder screenshot taken.")

    print("Verifying Manage Tags...")
    page.goto(f"{base_url}/#/settings/tags")
    # Click Add New Tag to open the modal
    page.get_by_text("Add New Tag").click()
    page.wait_for_selector("text=Create Tag")
    page.screenshot(path="verification/tag_form.png")
    print("Tag Form screenshot taken.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
