require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'associations' do
    it { is_expected.to have_many(:gmaps).dependent(:destroy) }
  end

  describe 'factory' do
    it 'has a valid factory' do
      expect(build(:user)).to be_valid
    end
  end

  describe 'validations (minimal, Devise validatable の確認)' do
    it 'is invalid without email' do
      user = build(:user, email: nil)
      expect(user).to be_invalid
      expect(user.errors[:email]).not_to be_empty
    end

    it "requires password at least Devise.password_length.min" do
      min = Devise.password_length.min
      pwd = 'a' * (min - 1)
      user = build(:user, password: pwd, password_confirmation: pwd)
      expect(user).to be_invalid
      expect(user.errors[:password]).not_to be_empty
    end
  end

  describe 'dependent: :destroy' do
    it 'destroys associated gmaps when user is destroyed' do
      user = create(:user)
      create_list(:gmap, 2, user: user)
      expect { user.destroy }.to change { Gmap.count }.by(-2)
    end
  end

  describe 'devise modules (smoke test)' do
    it 'includes expected devise modules' do
      expect(User.devise_modules).to include(
        :database_authenticatable, :registerable, :recoverable,
        :rememberable, :validatable, :jwt_authenticatable
      )
    end
  end
end
