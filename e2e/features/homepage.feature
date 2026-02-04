Feature: Homepage
  As a visitor
  I want to see the RetroShift homepage
  So that I can understand what the product does

  Scenario: Homepage loads correctly
    Given I am on the homepage
    Then I should see "Retrospectives on calls are awkward"
    And I should see "Create your first Retro — Free"
    And I should see the "Sign In" link

  Scenario: Homepage shows pricing section
    Given I am on the homepage
    Then I should see "Simple pricing"
    And I should see "Free"
    And I should see "Pro"
    And I should see "€9"

  Scenario: Navigate to create retro
    Given I am on the homepage
    When I click "Create your first Retro — Free"
    Then I should be on "/create"

  Scenario: Navigate to sign in
    Given I am on the homepage
    When I click "Sign In"
    Then I should be on "/login"

  Scenario: Navigate to pricing
    Given I am on the homepage
    When I click "Upgrade to Pro"
    Then I should be on "/pricing"
