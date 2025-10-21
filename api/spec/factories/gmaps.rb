# spec/factories/gmaps.rb
FactoryBot.define do
  factory :gmap do
    association :user
    title       { 'title' }
    comment     { 'comment' }
    magic_word  { 'secret' }
    latitude    { 35.0 }
    longitude   { 139.0 }

    # デフォルトで有効（画像付き）にする
    after(:build) do |g|
      next if g.picture.attached?
      g.picture.attach(
        io: File.open(Rails.root.join('spec/fixtures/files/sample.jpg')),
        filename: 'sample.jpg',
        content_type: 'image/jpeg'
      )
    end

    # 画像なし（バリデーションの失敗をテストしたい時に使う）
    trait :without_picture do
      after(:build) do |g|
        g.picture.purge if g.picture.attached?
      end
    end
  end
end
