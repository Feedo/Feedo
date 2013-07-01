class AddFaviconUrl < ActiveRecord::Migration
  def up
    add_column :feeds, :favicon_url, :string
  end

  def down
    remove_column :feeds, :favicon_url
  end
end
