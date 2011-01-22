class CreateChats < ActiveRecord::Migration
  def self.up
    
    create_table "chats", :force => true do |t|
      t.string   "owner"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.string   "channel"
    end
    
  end

  def self.down
    drop_table :chats
  end
end
