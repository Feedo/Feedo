class AddFeedItems < ActiveRecord::Migration
  def up
    create_table :feed_items do |t|
      t.integer :feed_id
      t.string :title
      t.text :content
      t.text :summary
      t.string :image
      t.date :published
      t.string :link
      t.string :author
      t.string :item_guid
    end
  end

  def down
    drop_table :feed_items
  end
end
