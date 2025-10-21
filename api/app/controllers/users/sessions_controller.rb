# app/controllers/users/sessions_controller.rb
class Users::SessionsController < Devise::SessionsController
  respond_to :json

  # デフォルトだとセッションに書く → API-only で 500
  # store: false でセッション保存を抑止
  def create
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource, store: false)
    render json: { user: resource }, status: :ok
  end

  def destroy
    # devise-jwt の revocation はミドルウェアが処理
    head :no_content
  end
end
