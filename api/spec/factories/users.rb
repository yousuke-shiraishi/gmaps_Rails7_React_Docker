# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    sequence(:email)    { |n| "user#{n}@example.com" }
    password            { 'password123' }
    password_confirmation { 'password123' }
    sequence(:username) { |n| "user#{n}" }
    birth               { Date.new(1990, 1, 1) }
  end
end
