# app/lib/custom_failure.rb
class CustomFailure < Devise::FailureApp
  def respond
    if request.format.json?
      json_error
    else
      super
    end
  end

  def json_error
    self.status        = 401
    self.content_type  = 'application/json'
    self.response_body = { error: I18n.t('devise.failure.unauthenticated') }.to_json
    # 例: "ログインしてください"（devise-i18n が日本語を提供）
  end
end
