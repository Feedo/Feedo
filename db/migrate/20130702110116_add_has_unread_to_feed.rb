class AddHasUnreadToFeed < ActiveRecord::Migration
  def up
    add_column :feeds, :has_unread, :boolean
  end

  def down
    remove_column :feeds, :has_unread
  end
end
