class User < ApplicationRecord
  has_many :gmaps, dependent: :destroy

  devise :database_authenticatable, :registerable,
       :recoverable, :rememberable, :validatable,
       :jwt_authenticatable,
       jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null
end
