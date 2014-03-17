require 'spec_helper'
 
describe TheModel do

  before :each do
    @i = TheModel.new
    @c = @i.class
    @saved_m = @c.varnish_invalidate_member
    @saved_c = @c.varnish_invalidate_collection
    @saved_i = @c.index_only
    @saved_r = @c.ranged_matchers
  end

  after :each do
    @c.ocean_resource_model invalidate_member: @saved_m,
                            invalidate_collection: @saved_c,
                            index: @saved_i,
                            ranged: @saved_r
  end



  it "ocean_resource_model should be available as a class method" do
  	@c.ocean_resource_model
  end
  

  it "should have a collection class method" do
    @c.collection
  end




  it "should accept an :index keyword arg" do
    @c.ocean_resource_model index: [:name]
  end
    
  it ":index should default to [:name]" do
    @c.ocean_resource_model
    @c.index_only.should == [:name]
  end

  it ":index should be reachable through a class method" do
    @c.ocean_resource_model index: [:foo, :bar]
    @c.index_only.should == [:foo, :bar]
  end



  it "should accept an :ranged keyword arg" do
    @c.ocean_resource_model ranged: []
  end
    
  it ":ranged should default to []" do
    @c.ocean_resource_model
    @c.ranged_matchers.should == []
  end

  it ":ranged should be reachable through a class method" do
    @c.ocean_resource_model ranged: [:foo, :bar]
    @c.ranged_matchers.should == [:foo, :bar]
  end



  it "should accept an :search keyword arg" do
  	@c.ocean_resource_model search: :description
  end
    
  it ":search should default to :description" do
  	@c.ocean_resource_model
  	@c.index_search_property.should == :description
  end

  it ":search should be reachable through a class method" do
  	@c.ocean_resource_model search: :zalagadoola
  	@c.index_search_property.should == :zalagadoola
  end



  it "should accept a :page_size keyword arg" do
    @c.ocean_resource_model page_size: 100
  end

  it ":page_size should default to 25" do
    @c.ocean_resource_model
    @c.collection_page_size.should == 25
  end

  it ":page_size should be reachable through a class method" do
    @c.ocean_resource_model page_size: 10
    @c.collection_page_size.should == 10
  end



  it "should have a latest_api_version class method" do
  	@c.latest_api_version.should == "v1"
  end



  it "should have an instance method to touch two instances" do
  	other = TheModel.new
  	@i.should_receive(:touch).once
  	other.should_receive(:touch).once
  	@i.touch_both(other)
  end


  it "should accept an :invalidate_collection keyword arg" do
    @c.ocean_resource_model invalidate_collection: ['$', '?']
  end

  it ":invalidate_collection should default to INVALIDATE_COLLECTION_DEFAULT" do
    @c.ocean_resource_model
    @c.varnish_invalidate_collection.should == INVALIDATE_COLLECTION_DEFAULT
  end

  it ":invalidate_collection should be reachable through a class method" do
    @c.ocean_resource_model invalidate_collection: ['a', 'b', 'c']
    @c.varnish_invalidate_collection.should == ['a', 'b', 'c']
  end

  it "should have a class method to invalidate all collections in Varnish" do
    Api.stub(:ban)
    @c.invalidate
  end

  it "the invalidation class method should use the suffixes defined by :invalidate_collection" do
    Api.should_receive(:ban).with("/v[0-9]+/the_models" + INVALIDATE_COLLECTION_DEFAULT.first)
    @c.invalidate
  end


  it "should accept an :invalidate_member keyword arg" do
    @c.ocean_resource_model invalidate_member: ['/', '$', '?']
  end

  it ":invalidate_member should default to INVALIDATE_MEMBER_DEFAULT" do
    @c.ocean_resource_model
    @c.varnish_invalidate_member.should == INVALIDATE_MEMBER_DEFAULT
  end

  it ":invalidate_member should be reachable through a class method" do
    @c.ocean_resource_model invalidate_member: ['x', 'y', 'z']
    @c.varnish_invalidate_member.should == ['x', 'y', 'z']
  end

  it "should have an instance method to invalidate itself in Varnish" do
    Api.stub(:ban)
    @i.invalidate
  end

  it "the invalidation instance method should use the suffixes defined by :invalidate_member AND :invalidate_collection" do
    # The basic collection
    Api.should_receive(:ban).once.with("/v[0-9]+/the_models#{INVALIDATE_COLLECTION_DEFAULT.first}")
    # The member itself and its subordinate relations/collections
    Api.should_receive(:ban).once.with("/v[0-9]+/the_models/#{@i.id}#{INVALIDATE_MEMBER_DEFAULT.first}")
    # The lambda
    Api.should_receive(:ban).once.with("/v[0-9]+/foo/bar/baz($|?)")
    # Do it!
    @i.invalidate
  end


  it "should accept a :create_timestamp keyword arg" do
    @c.ocean_resource_model create_timestamp: :first_spawned_at
  end

  it ":create_timestamp should default to :created_at" do
    @c.ocean_resource_model
    @c.create_timestamp.should == :created_at
  end

  it ":create_timestamp should be reachable through a class method" do
    @c.ocean_resource_model create_timestamp: :first_spawned_at
    @c.create_timestamp.should == :first_spawned_at
  end


  it "should accept an :update_timestamp keyword arg" do
    @c.ocean_resource_model update_timestamp: :last_fucked_up_at
  end

  it ":update_timestamp should default to :updated_at" do
    @c.ocean_resource_model
    @c.update_timestamp.should == :updated_at
  end

  it ":update_timestamp should be reachable through a class method" do
    @c.ocean_resource_model update_timestamp: :last_fucked_up_at
    @c.update_timestamp.should == :last_fucked_up_at
  end


end
