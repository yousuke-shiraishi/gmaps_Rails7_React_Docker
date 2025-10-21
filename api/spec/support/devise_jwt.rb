# spec/support/devise_jwt.rb
require 'devise/jwt/test_helpers'

module AuthHelpers
  # 常に JSON を受け取りたいので ACCEPT を必ず付与
  def json_headers(extra = {})
    { 'ACCEPT' => 'application/json' }.merge(extra)
  end

  def auth_headers_for(user, extra_headers = {})
    base = json_headers(extra_headers)
    Devise::JWT::TestHelpers.auth_headers(base, user)
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
