# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  # POST /users
  def create
    build_resource(sign_up_params)

    if resource.save
      # ★ API では自動ログインしない（= セッションに書かない）
      # sign_up(resource_name, resource) を呼ばない
      render json: resource, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
