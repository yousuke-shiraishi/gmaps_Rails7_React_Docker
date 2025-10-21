module Api
  module V1
    class HealthController < ApplicationController
      def show
        render json: { ok: true, time: Time.current }
      end
    end
  end
end
