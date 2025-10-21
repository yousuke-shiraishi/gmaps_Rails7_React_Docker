class RemovePictureFromGmaps < ActiveRecord::Migration[7.2] # ←プロジェクトに合わせる
  def up
    remove_column :gmaps, :picture, :string if column_exists?(:gmaps, :picture)
  end

  def down
    add_column :gmaps, :picture, :string unless column_exists?(:gmaps, :picture)
  end
end

