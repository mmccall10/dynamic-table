/* global toastr */
/* global app */
app.directive('dynamicTable', function(){
 var controller = function($scope, $http){
    var offset = 0;
    $scope.pageNum = 0;
    $scope.total = 0;
    $scope.limit = '5';
    $scope.viewRange = {};
    $scope.reverse = false;
    $scope.loadNext = false;
    $scope.loadPrev = false;
    $scope.limitOptions = [25,50,100,200,300];
    $scope.pages = 0;
    $scope.currentPage = 0;
    $scope.jumpPage = '1';
    $scope.pagearray = [];
    $scope.results = [];

    $scope.sortColumn = function(predicate) {
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
      $scope.predicate = predicate;
    };

    $scope.next = function(){
      offset = offset + parseInt($scope.limit);
      getResults();
      $scope.loadNext = true;
    };

    $scope.previous = function(){
      offset = offset - parseInt($scope.limit);
      getResults();
      $scope.loadPrev = true;
    };

    $scope.first = function(){
      offset = 0;
      $scope.loadFirst = true;
      getResults();
    };

    $scope.last = function(){
      offset = $scope.total - ($scope.total % $scope.limit);
      $scope.loadLast = true;
      getResults();
    };

    $scope.query = function(){
        offset = 0;
        getResults();
    };

    $scope.clearQuery = function(){
      $scope.queryVal = '';
    };

    $scope.updateLimitResults = function(){
      offset = 0;
      getResults();
    };
    
    $scope.jumpTo = function(){
      offset = (parseInt($scope.limit) * parseInt($scope.jumpPage)) - parseInt($scope.limit);
      getResults();
    };
    
    $scope.$on('refreshResults', function(event, args){
      getResults();
    });

    var setPageNav = function(){
      $scope.pagearray = [];
      $scope.pages = Math.ceil($scope.total / $scope.limit);
      $scope.currentPage =  (offset / $scope.limit) + 1;
      var i;
      for(i = 1; i <= $scope.pages; i ++){
        $scope.pagearray.push(i);
      }
    };

   var resetPaginator = function(){
      $scope.loadNext = false;
      $scope.loadPrev = false;
      $scope.loadFirst = false;
      $scope.loadLast = false;
    };

    var getResults = function(){
      
      var url = $scope.url+'?limit='+$scope.limit+'&offset='+offset;
      
      var stringParams = '';
      if(typeof $scope.stringFilters === 'object'){
        angular.forEach($scope.stringFilters, function(value, key){
          stringParams += '&'+key+'='+value;
        });
      }
      
      if(stringParams.length > 0){
        url += stringParams;
      }
      
      $http({method: 'GET', url: url})
        .then(function(response){
          $scope.results = [];
          $scope.results.push.apply($scope.results, response.data.items);
          $scope.total = response.data.count;
          $scope.viewRange = {'start': offset + 1, 'end': offset + response.data.items.length};
          setPageNav();
          $('.mask').hide();
          resetPaginator();
      });
    };

    $scope.deleteResult =  function(id, msgItem){
      if(confirm('Are you sure you?')){
       msgItem = msgItem ? msgItem+' ' : '';
       var url = $scope.url+'/delete';
        $http.post(url, {id:id})
          .then(function(response){
            toastr.success(msgItem+'Successfully Deleted','Success',{timeOut: 5000});
            getResults();
          }, function(){
            toastr.error(msgItem+'could not be deleted.','Error',{timeOut: 5000});
        });
      }
    };

    getResults();
    $scope.sortColumn($scope.defaultSort);
  };

  return {
    restrict: 'E',
    scope: {
      tableTmpl: '@',
      url: '@',
      defaultSort: '@',
      stringFilters: '=',
      options: '='
    },
    transclude: true,
    templateUrl: '/templates/dynamic_table.html',
    controller: controller
  };
});

