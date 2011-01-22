class ChangeMessageToUserId < ActiveRecord::Migration

  def self.up
    add_column :messages, :user_id, :integer
    remove_column :messages, :username
  end

  def self.down
    remove :messages, :user_id
    add_column :messages, :username, :string
  end
  
end
