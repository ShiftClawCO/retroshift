Feature: Create Retrospective
  As a logged-in user
  I want to create retrospectives
  So that I can collect team feedback

  Background:
    Given I am logged in

  Scenario: Create retro with Start/Stop/Continue format
    Given I am on the "/create" page
    When I enter "Sprint 42 Retro" in the "Title" field
    And I select "start-stop-continue" from "Format"
    And I click "Create Retro"
    Then I should be on the dashboard
    And I should see "Sprint 42 Retro"
    And I should see "Copy team link"

  Scenario: Create retro without title shows error
    Given I am on the "/create" page
    When I click "Create Retro"
    Then I should see "Please enter a title"

  Scenario: See retro count as free user
    Given I have 2 active retros
    And I am on the "/create" page
    Then I should see "2 of 3 free retros used"

  @limit
  Scenario: Free user cannot exceed 3 retros
    Given I have 3 active retros
    And I am on the "/create" page
    When I enter "New Retro" in the "Title" field
    And I click "Create Retro"
    Then I should see "limit"
    And I should see "Upgrade to Pro"
