require 'rails_helper'
require 'digest'

RSpec.describe 'Api::V1::Gmaps search', type: :request do
  before { host! 'www.example.com' }
  let(:me) { create(:user, email: 'me@example.com', username: 'taro', birth: '1990-01-01') }

  # magic が present? のときだけ MD5 化する
  def make_gmap(owner, magic: 'secret')
    stored = magic.present? ? Digest::MD5.hexdigest(magic) : nil  # ←ここがポイント
    rec = owner.gmaps.new(title: 't', comment: 'c', latitude: 35, longitude: 139, magic_word: stored)
    rec.picture.attach(io: File.open(Rails.root.join('spec/fixtures/files/sample.jpg')),
                       filename: 'sample.jpg', content_type: 'image/jpeg')
    rec.save!
    rec
  end

  describe 'GET /api/v1/gmaps/search_public' do
    it 'username + birth で公開検索できる（未認証OK）' do
      make_gmap(me, magic: nil)   # ← 公開扱い（magic_word 空）で作る
      get '/api/v1/gmaps/search_public',
          params: { username: 'taro', birth: '1990-01-01' }, headers: json_headers
      expect(response).to have_http_status(:ok)
      expect(json).not_to be_empty
      expect(json.first.dig('user', 'username')).to eq('taro')
    end

    it 'birth が不正なら 422' do
      get '/api/v1/gmaps/search_public', params: { username: 'taro', birth: 'xxx' }, headers: json_headers
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'username が無いと 422' do
      get '/api/v1/gmaps/search_public', params: { birth: '1990-01-01' }, headers: json_headers
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'birth が無いと 422' do
      get '/api/v1/gmaps/search_public', params: { username: 'ghost' }, headers: json_headers
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'ユーザーが存在しない場合は 200 + 空配列' do
      get '/api/v1/gmaps/search_public', params: { username: 'ghost', birth: '1990-01-01' }, headers: json_headers
      expect(response).to have_http_status(:ok)
      expect(json).to eq([])
    end
  end

  describe 'POST /api/v1/gmaps/search_private' do
    it 'email + magic_word で公開検索できる（未認証OK）' do
      make_gmap(me, magic: 'open')  # ← 非公開（magic あり＝MD5 保存）
      post '/api/v1/gmaps/search_private',
           params: { email: 'me@example.com', magic_word: 'open' }, headers: json_headers
      expect(response).to have_http_status(:ok)
      expect(json).not_to be_empty
      expect(json.first['magic_word']).to eq(Digest::MD5.hexdigest('open'))
      expect(json.first.dig('user', 'email')).to eq('me@example.com')
    end

    it 'パラメータ不足は 422' do
      post '/api/v1/gmaps/search_private', params: { email: 'me@example.com' }, headers: json_headers
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'email が存在しないと 200 + 空配列' do
      post '/api/v1/gmaps/search_private',
           params: { email: 'none@example.com', magic_word: 'open' }, headers: json_headers
      expect(response).to have_http_status(:ok)
      expect(json).to eq([])
    end

    it 'magic_word が不一致だと 200 + 空配列' do
      make_gmap(me, magic: 'open')
      post '/api/v1/gmaps/search_private',
           params: { email: 'me@example.com', magic_word: 'WRONG' }, headers: json_headers
      expect(response).to have_http_status(:ok)
      expect(json).to eq([])
    end
  end
end
