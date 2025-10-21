# app/controllers/api/v1/gmaps_controller.rb
module Api
  module V1
    class GmapsController < ApplicationController
      require 'digest'
      before_action :authenticate_user!, only: %i[create destroy]
      skip_before_action :verify_authenticity_token, raise: false
      before_action :set_own_gmap, only: :destroy

      # GET /api/v1/gmaps（未認証OK）
      def index
        gmaps = Gmap.with_attached_picture
                    .includes(:user)
                    .where(magic_word: [nil, ""])
                    .order(created_at: :desc).limit(50)
        render json: serialize(gmaps), status: :ok
      end

      # POST /api/v1/gmaps（認証必須）
      def create
        gmap = current_user.gmaps.new(gmap_params.except(:picture))
        if (pic = gmap_params[:picture]).present?
          gmap.picture.attach(pic)
        end

        if gmap.save
          render json: serialize(gmap), status: :created
        else
          render json: { errors: gmap.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/gmaps/:id（認証必須・本人のみ）
      def destroy
        @gmap.destroy!
        head :no_content
      end

      # GET /api/v1/gmaps/search_public?username=...&birth=YYYY-MM-DD（未認証OK）
      def search_public
        if params[:username].blank? || params[:birth].blank?
          return render json: { error: 'usernameとbirthの両方が必要です' }, status: :unprocessable_entity
        end

        begin
          Date.iso8601(params[:birth])
        rescue ArgumentError
          return render json: { error: 'birthパラメータの形式が不正です' }, status: :unprocessable_entity
        end

        user = User.find_by(username: params[:username], birth: params[:birth])
        return render json: [], status: :ok unless user

        gmaps = user.gmaps
                    .with_attached_picture
                    .includes(:user)
                    .where(magic_word: [nil, ""])
                    .order(created_at: :desc).limit(50)
        render json: serialize(gmaps), status: :ok
      end

      # POST /api/v1/gmaps/search_private（未認証OK）
      def search_private
        email      = params[:email]
        magic_word = params[:magic_word]
        if email.blank? || magic_word.blank?
          return render json: { error: 'emailとmagic_wordの両方を指定してください' }, status: :unprocessable_entity
        end

        user = User.find_by(email: email)
        return render json: [], status: :ok unless user

        digest = Digest::MD5.hexdigest(magic_word)
        gmaps = user.gmaps.where(magic_word: digest)
                    .with_attached_picture
                    .includes(:user)
                    .order(created_at: :desc).limit(50)
        render json: serialize(gmaps), status: :ok
      end

      private

      def gmap_params
        params.require(:gmap).permit(:title, :comment, :magic_word, :latitude, :longitude, :picture)
      end

      def set_own_gmap
        @gmap = current_user.gmaps.find(params[:id]) # 他人のIDは 404
      end

      def serialize(record_or_relation)
        list = Array(record_or_relation).map do |g|
          h = g.as_json(
            only: %i[id title comment magic_word latitude longitude user_id g created_at updated_at],
            include: { user: { only: %i[id username email] } }
          )
          h['picture_url'] =
            if g.picture.attached?
              Rails.application.routes.url_helpers.rails_blob_path(g.picture, only_path: true)
            else
              nil
            end
          h
        end
        record_or_relation.is_a?(Array) || record_or_relation.is_a?(ActiveRecord::Relation) ? list : list.first
      end
    end
  end
end
