class AddReadToFeedItem < ActiveRecord::Migration
  def up
    add_column :feed_items, :read, :boolean, :default => false
  end

  def down
    remove_column :feed_items, :read
  end
end
