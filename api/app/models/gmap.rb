class Gmap < ApplicationRecord
  require "digest"
  belongs_to :user

  has_one_attached :picture

  validates :title,     presence: true, length: { minimum: 1, maximum: 25 }
  validates :comment,   presence: true, length: { minimum: 1, maximum: 255 }
  validates :latitude,  presence: true
  validates :longitude, presence: true

  # 画像必須にしたいなら簡易バリデーション
  validate :picture_presence

  before_save :encrypt_magic_word



  # app/models/gmap.rb
  # def picture_url
  #   return nil unless picture.attached?
  #   Rails.application.routes.url_helpers.rails_blob_url(
  #     picture,
  #     host: 'http://localhost',
  #     port: 3000
  #   )
  # end

    # 追加/修正
  def picture_url
    att = picture
    return nil unless att&.attached? && att.blob&.persisted?
    Rails.application.routes.url_helpers.rails_blob_path(att, only_path: true)
  end

  def public?
    magic_word.blank?
  end


  def encrypt_magic_word
    self.magic_word =
      if magic_word.blank?
        ""
      elsif magic_word.match?(/\A\h{32}\z/)   # 32桁の16進＝MD5とみなす
        magic_word
      else
        Digest::MD5.hexdigest(magic_word)
      end
  end

  private
  def picture_presence
    errors.add(:picture, "must be attached") unless picture.attached?
  end
end
