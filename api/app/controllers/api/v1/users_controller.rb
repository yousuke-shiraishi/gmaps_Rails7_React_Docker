module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!
      before_action :set_user, only: %i[show update]

      # GET /api/v1/users
      # ※必要に応じて管理用。自分だけ返すなら current_user だけを返す形にしてもOK
      def index
        users = User.select(:id, :email, :username, :birth, :created_at, :updated_at).order(id: :asc)
        render json: users
      end

      # GET /api/v1/users/:id
      def show
        render json: @user.slice(:id, :email, :username, :birth, :created_at, :updated_at)
      end

      def current
        render json: current_user.slice(:id, :email, :username, :birth)
      end
      # PATCH/PUT /api/v1/users/:id
      # ※本人以外の更新は禁止
      def update
        return render(json: { error: 'forbidden' }, status: :forbidden) if @user.id != current_user.id

        if @user.update(user_params)
          render json: @user.slice(:id, :email, :username, :birth, :created_at, :updated_at)
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_user
        @user = User.find(params[:id])
      end

      def user_params
        params.require(:user).permit(:email, :username, :birth)
      end
    end
  end
end

