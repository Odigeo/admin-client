require 'spec_helper'

describe TheModelsController do
  
  render_views

  describe "INDEX" do
    
    before :each do
      permit_with 200
      Api.stub(:ban)
      create :the_model  # page 0
      create :the_model
      create :the_model
      create :the_model

      create :the_model  # page 1
      create :the_model
      create :the_model
      create :the_model

      create :the_model  # page 2
      create :the_model
      request.headers['HTTP_ACCEPT'] = "application/json"
      request.headers['X-API-Token'] = "boy-is-this-fake"
    end

    
    it "should return JSON" do
      get :index
      response.content_type.should == "application/json"
    end
    
    it "should return a 400 if the X-API-Token header is missing" do
      request.headers['X-API-Token'] = nil
      get :index
      response.status.should == 400
      response.content_type.should == "application/json"
    end
    
    it "should return a 200 when successful" do
      get :index
      response.status.should == 200
      response.should render_template(partial: "_the_model", count: 10)
    end

    it "should return a collection with count, total count, page, page_size, and total_pages" do
      get :index, page_size: 4, page: 0
      response.status.should == 200
      wrapper = JSON.parse(response.body)
      wrapper.should be_a Hash
      resource = wrapper['_collection']
      resource.should be_a Hash
      coll = resource['resources']
      coll.should be_an Array
      coll.count.should == 4
      n = resource['count']
      n.should == 4
      n = resource['total_count']
      n.should == 10
      n = resource['page']
      n.should == 0
      n = resource['page_size']
      n.should == 4
      n = resource['total_pages']
      n.should == 3
    end

    it "should return a collection with count, total count, page, page_size, and total_pages" do
      get :index, page_size: 5, page: 0
      response.status.should == 200
      wrapper = JSON.parse(response.body)
      wrapper.should be_a Hash
      resource = wrapper['_collection']
      resource.should be_a Hash
      coll = resource['resources']
      coll.should be_an Array
      coll.count.should == 5
      n = resource['count']
      n.should == 5
      n = resource['total_count']
      n.should == 10
      n = resource['page']
      n.should == 0
      n = resource['page_size']
      n.should == 5
      n = resource['total_pages']
      n.should == 2
    end

    it "should return a collection with a _links array and a self link" do
      get :index
      response.status.should == 200
      wrapper = JSON.parse(response.body)
      resource = wrapper['_collection']
      links = resource['_links']
      links.should be_a Hash
      links['self'].should be_a Hash
      links['self']['href'].should == "https://forbidden.example.com/v1/the_models"
      links['self']['type'].should == "application/json"
    end

    it "should return a paged collection with all hyperlinks" do
      get :index, page_size: 3, page: 2
      response.status.should == 200
      wrapper = JSON.parse(response.body)
      wrapper.should be_a Hash
      resource = wrapper['_collection']
      resource.should be_a Hash
      links = resource['_links']
      links.should be_a Hash
      links['first_page'].should be_a Hash
      links['first_page']['href'].should ==    "https://forbidden.example.com/v1/the_models?page=0&page_size=3"
      links['last_page'].should be_a Hash
      links['last_page']['href'].should ==     "https://forbidden.example.com/v1/the_models?page=3&page_size=3"
      links['previous_page'].should be_a Hash
      links['previous_page']['href'].should == "https://forbidden.example.com/v1/the_models?page=1&page_size=3"
      links['next_page'].should be_a Hash
      links['next_page']['href'].should ==     "https://forbidden.example.com/v1/the_models?page=3&page_size=3"
    end

    it "should not include a previous page if already at first page" do
      get :index, page_size: 3, page: 0
      response.status.should == 200
      wrapper = JSON.parse(response.body)
      wrapper.should be_a Hash
      resource = wrapper['_collection']
      resource.should be_a Hash
      links = resource['_links']
      links.should be_a Hash
      links['previous_page'].should == nil
    end

    it "should not include a next page if already at last page" do
      get :index, page_size: 4, page: 2
      response.status.should == 200
      wrapper = JSON.parse(response.body)
      wrapper.should be_a Hash
      resource = wrapper['_collection']
      resource.should be_a Hash
      links = resource['_links']
      links.should be_a Hash
      links['next_page'].should == nil
    end


  end
  
end
