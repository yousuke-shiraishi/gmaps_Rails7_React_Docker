# spec/requests/api/v1/gmaps_spec.rb
require 'rails_helper'

RSpec.describe 'Api::V1::Gmaps', type: :request do
  before { host! 'www.example.com' }
  let(:user) { create(:user) }
  let(:file) { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/sample.jpg'), 'image/jpeg') }



  describe 'GET /api/v1/gmaps' do
    it '未認証でも 200（公開一覧）' do
      get '/api/v1/gmaps', headers: json_headers
      expect(response).to have_http_status(:ok)
    end

    it '画像が外されたレコードは picture_url が null になる' do
      g = create_gmap_with_image(user)
      g.picture.purge   # ← 保存後に添付を外す

      get '/api/v1/gmaps', headers: json_headers
      expect(response).to have_http_status(:ok)
      expect(json).not_to be_empty
      expect(json.first['picture_url']).to be_nil  # ← else 分岐を踏む
    end
  end

  describe 'POST /api/v1/gmaps' do
    let(:path) { '/api/v1/gmaps' }

    it '未認証は 401' do
      params = { gmap: { title: 't', comment: 'c', latitude: 35, longitude: 139, picture: file } }
      post path, params:, headers: json_headers
      expect(response).to have_http_status(:unauthorized)
    end

    it '認証済なら画像付きで作成でき、201 と JSON を返す' do
      params = { gmap: { title: 't', comment: 'c', latitude: 35.0, longitude: 139.0, picture: file } }
      expect {
        post path, params:, headers: auth_headers_for(user)
      }.to change(Gmap, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it '認証済でも必須欠如なら 422 を返す' do
      # title を欠落させる（他の必須があればそちらでもOK）
      params = { gmap: { comment: 'c', latitude: 35.0, longitude: 139.0 } }
      post '/api/v1/gmaps', params:, headers: auth_headers_for(user)
      expect(response).to have_http_status(:unprocessable_entity)
      # 可能ならエラーフォーマットも軽く確認
      expect(JSON.parse(response.body)).to have_key('errors')
    end
  end

  describe 'DELETE /api/v1/gmaps/:id' do
    it '未認証は 401' do
      g = create_gmap_with_image(user)
      delete "/api/v1/gmaps/#{g.id}", headers: json_headers
      expect(response).to have_http_status(:unauthorized)
    end
 
    it '本人なら削除できる（204）' do
      g = create_gmap_with_image(user)
      expect {
        delete "/api/v1/gmaps/#{g.id}", headers: auth_headers_for(user)
      }.to change(Gmap, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
 
    it '他人のレコードは 404' do
      me = create(:user)
      other = create(:user)
      g = create_gmap_with_image(other)
      delete "/api/v1/gmaps/#{g.id}", headers: auth_headers_for(me)
      expect(response).to have_http_status(:not_found)
    end
  end


  # ヘルパ
  def create_gmap_with_image(owner)
    rec = owner.gmaps.new(title: 't', comment: 'c', latitude: 35, longitude: 139)
    rec.picture.attach(io: File.open(Rails.root.join('spec/fixtures/files/sample.jpg')),
                       filename: 'sample.jpg', content_type: 'image/jpeg')
    rec.save!
    rec
  end
end
