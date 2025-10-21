class CreateGmaps < ActiveRecord::Migration[7.2]
  def change
    create_table :gmaps do |t|
      t.string :title
      t.text :comment
      t.string :magic_word
      t.float :latitude
      t.float :longitude
      t.references :user, null: false, foreign_key: true
      t.string :g

      t.timestamps
    end
  end
end
