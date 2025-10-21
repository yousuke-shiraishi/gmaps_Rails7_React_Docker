require 'spec_helper'

ENV['RAILS_ENV'] ||= 'test'
# RSpec 実行時に .env / システム環境から注入される DATABASE_URL を無効化
ENV.delete('DATABASE_URL')
ENV['DEVISE_JWT_SECRET_KEY'] ||= 'test_secret_key_change_me'

require File.expand_path('../config/environment', __dir__)
abort('The Rails environment is running in production mode!') if Rails.env.production?
require 'factory_bot_rails'
require 'rspec/rails'

Dir[Rails.root.join('spec/support/**/*.rb')].sort.each { |f| require f }

RSpec.configure do |config|
  config.before(:each, type: :request) { host! 'www.example.com' }
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
  config.include FactoryBot::Syntax::Methods

  config.before(:suite) do
    host_cfg = { host: 'www.example.com', protocol: 'http' }
    Rails.application.routes.default_url_options = host_cfg
    ActiveStorage::Current.url_options = host_cfg if defined?(ActiveStorage::Current)
  end
end

# shoulda-matchers
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
