# db/seeds.rb
require 'faker'

# 都道府県中心座標の一部リスト（必要なら全県追加）
PREFS = [
  { name: '北海道',     lat: 43.06417, lon: 141.34694 },
  { name: '青森県',     lat: 40.82444, lon: 140.74    },
  { name: '宮城県',     lat: 38.26884, lon: 140.87194 },
  { name: '東京都',     lat: 35.68950, lon: 139.69170  },
  { name: '神奈川県',   lat: 35.44778, lon: 139.64250  },
  { name: '愛知県',     lat: 35.18028, lon: 136.90667  },
  { name: '大阪府',     lat: 34.68639, lon: 135.52000  },
  { name: '広島県',     lat: 34.39627, lon: 132.45937  },
  { name: '福岡県',     lat: 33.60639, lon: 130.41806  },
  { name: '沖縄県',     lat: 26.21231, lon: 127.67915  }
]

def jitter_deg(km)
  # 緯度1度 ≒ 111km
  Faker::Number.normal(mean: 0.0, standard_deviation: km/111.0).to_f
end

SEED_IMAGE_PATH = Rails.root.join('db', 'seed_images', 'sample.jpg')
unless File.exist?(SEED_IMAGE_PATH)
  puts "Warning: sample image not found at #{SEED_IMAGE_PATH}. Skipping image attachment."
end

# ユーザを3人作る（既存ならスキップ）
users = []
3.times do |i|
  u = User.find_or_create_by!(email: "seed_user#{i+1}@example.com") do |user|
    user.password = 'password'
    user.username = "seed_user#{i+1}"
    user.birth = Date.new(1990,1,1) + i.year + i.month # 適当に違う生年月日
  end
  users << u
end

# 各ユーザに10個ずつ Gmap 作成
users.each do |user|
  10.times do
    base = PREFS.sample
    lat_j = base[:lat] + jitter_deg(5)
    lon_j = base[:lon] + (jitter_deg(5) / Math.cos(base[:lat] * Math::PI / 180.0))

    g = user.gmaps.new(
      title: Faker::Lorem.words(number: 2).join(' '),
      comment: Faker::Lorem.sentence(word_count: 12),
      latitude: lat_j,
      longitude: lon_j,
      magic_word: ['','', Faker::Alphanumeric.alphanumeric(number: 6)].sample
    )

    if File.exist?(SEED_IMAGE_PATH)
      g.picture.attach(
        io: File.open(SEED_IMAGE_PATH),
        filename: "seed_#{SecureRandom.hex(4)}.jpg",
        content_type: 'image/jpeg'
      )
    end

    g.save!
  end
end

puts "Seeded #{users.size * 10} Gmap records for #{users.size} users."
