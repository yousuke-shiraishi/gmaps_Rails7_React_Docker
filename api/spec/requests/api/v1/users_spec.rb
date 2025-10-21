# spec/requests/api/v1/users_spec.rb
require 'rails_helper'

RSpec.describe 'Api::V1::UsersController', type: :request do
  let(:me)    { create(:user) }
  let(:other) { create(:user) }

  it '未認証は 401' do
    get '/api/v1/users', headers: json_headers
    expect(response).to have_http_status(:unauthorized)
  end

  it '認証済は一覧を返す（必要項目のみ）' do
    get '/api/v1/users', headers: auth_headers_for(me)
    expect(response).to have_http_status(:ok)
    expect(json.first.keys).to contain_exactly('id','email','username','birth','created_at','updated_at')
  end

  it 'show は任意ユーザーを返す' do
    get "/api/v1/users/#{other.id}", headers: auth_headers_for(me)
    expect(response).to have_http_status(:ok)
    expect(json['id']).to eq(other.id)
  end

  it '本人は更新できる' do
    put "/api/v1/users/#{me.id}",
        params: { user: { username: 'me2' } }.to_json,
        headers: auth_headers_for(me).merge('Content-Type' => 'application/json')

    expect(response).to have_http_status(:ok)
    expect(json['username']).to eq('me2')
  end

  it '他人を更新すると 403' do
    put "/api/v1/users/#{other.id}",
        params: { user: { username: 'hacked' } }.to_json,
        headers: auth_headers_for(me).merge('Content-Type' => 'application/json')

    expect(response).to have_http_status(:forbidden)
    expect(json['error']).to eq('forbidden')
  end
  it 'GET /api/v1/users/current_user はログイン中のユーザー情報を返す' do
    get '/api/v1/users/current_user', headers: auth_headers_for(me)
    expect(response).to have_http_status(:ok)
    expect(json.keys).to contain_exactly('id','email','username','birth')
    expect(json['id']).to eq(me.id)
  end

  it '本人でも更新失敗したら 422 と errors を返す（失敗をスタブ）' do
    # 1) 先にログインヘッダを作る（Deviseの内部update等に影響させない）
    headers = auth_headers_for(me)

    # 2) コントローラで叩かれる update の「このパラメータに限り」失敗させる
    allow_any_instance_of(User)
      .to receive(:update).with(hash_including(username: 'still_me'))
      .and_return(false)

    # 3) errors の中身はそのまま、full_messages だけ用意
    allow_any_instance_of(ActiveModel::Errors)
      .to receive(:full_messages).and_return(['update failed'])

    put "/api/v1/users/#{me.id}",
        params: { user: { username: 'still_me' } }.to_json,
        headers: headers.merge('Content-Type' => 'application/json')

    expect(response).to have_http_status(:unprocessable_entity)
    expect(json).to eq('errors' => ['update failed'])
  end

end
