class CreateChatUsers < ActiveRecord::Migration
  def self.up
    create_table :chat_users do |t|
      t.string "nickname"
      t.timestamps
    end
  end

  def self.down
    drop_table :chat_users
  end
end
