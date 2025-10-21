# app/serializers/gmap_serializer.rb
class GmapSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id, :title, :comment, :latitude, :longitude,
             :magic_word, :picture_url, :user_id, :created_at, :updated_at

  def picture_url
    return nil unless object.picture.attached?
    rails_blob_url(object.picture, disposition: "inline") # redirect方式
  end

  def username
    object.user.username
  end
end
