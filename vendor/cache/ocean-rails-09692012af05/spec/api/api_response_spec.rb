require 'spec_helper'

require 'base64'


describe Api::Response do

	before :each do
	  @response = Api::Response.new(
	  	double response_code:    200,
	  	       response_headers: "Foo: 123\r\nBar: baz\r\nQuux-Zuul: fedcba",
	  	       response_body:    '{"a":1,"b":2}')
	end


	it "should be instantiatable and take one arg" do
	  @response.should be_an Api::Response
	end

	it "should have a status reader" do
	  @response.status.should be_an Integer
	end

	it "should have a headers reader" do
	  @response.headers.should == {"Foo"=>"123", "Bar"=>"baz", "Quux-Zuul"=>"fedcba"}
	end

	it "should have a body reader" do
	  @response.body.should == {"a"=>1, "b"=>2}
	end

	it "should convert the JSON body only once" do
    JSON.should_receive(:parse).exactly(1).times.and_return({"a"=>1,"b"=>2})
	  @response.body
	  @response.body
	  @response.body
	end


end
  
