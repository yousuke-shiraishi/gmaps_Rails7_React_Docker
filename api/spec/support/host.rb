RSpec.configure do |config|
  config.before(:each, type: :request) { host! 'www.example.com' }
end
