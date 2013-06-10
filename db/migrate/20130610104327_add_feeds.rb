class AddFeeds < ActiveRecord::Migration
  def up
    create_table :feeds do |t|
      t.string :file_url
      t.string :title
      t.string :link
      t.text :description
    end
  end

  def down
    drop_table :feeds
  end
end
