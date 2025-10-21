# spec/models/gmap_spec.rb
require 'rails_helper'

RSpec.describe Gmap, type: :model do
  let(:user) { create(:user) }

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_one_attached(:picture) }
  end

  describe 'custom validations' do
    it 'picture が無いと無効' do
      g = described_class.new(title: 't', comment: 'c', latitude: 35, longitude: 139, user:)
      expect(g).to be_invalid
      # I18n/英語メッセージ差異に強くする
      expect(g.errors[:picture].join).to match(/attach/i)
    end

    it 'picture を付ければ有効' do
      g = described_class.new(title: 't', comment: 'c', latitude: 35, longitude: 139, user:)
      g.picture.attach(
        io: File.open(Rails.root.join('spec/fixtures/files/sample.jpg')),
        filename: 'sample.jpg',
        content_type: 'image/jpeg'
      )
      expect(g).to be_valid
    end
  end

  describe '#public?' do
    it 'magic_word が空なら true' do
      g = build(:gmap, title: 't', comment: 'c', latitude: 35, longitude: 139, magic_word: nil, user: user)
      expect(g.public?).to be(true)
    end

    it 'magic_word があれば false' do
      g = build(:gmap, title: 't', comment: 'c', latitude: 35, longitude: 139, magic_word: 'x', user: user)
      expect(g.public?).to be(false)
    end
  end

  describe '#picture_url' do
    it '未添付なら nil' do
      g = build(:gmap, title: 't', comment: 'c', latitude: 35, longitude: 139, user: user)
      expect(g.picture_url).to be_nil
    end

    it '添付ありならパスを返す' do
      g = described_class.new(title: 't', comment: 'c', latitude: 35, longitude: 139, user: user)
      g.picture.attach(io: File.open(Rails.root.join('spec/fixtures/files/sample.jpg')),
                      filename: 'sample.jpg', content_type: 'image/jpeg')
      g.save!
      expect(g.picture_url).to match(%r{\A/rails/active_storage/blobs/})
    end
  end
end
