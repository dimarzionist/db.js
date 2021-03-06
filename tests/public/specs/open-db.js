(function ( db , describe , it , runs , expect , waitsFor , beforeEach , afterEach ) {
    'use strict';
    describe( 'db.open' , function () {
        var server,
            dbName = 'my-test-db',
            indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;
        
        beforeEach( function () {
            var done = false;
            
            runs( function () {
                var req = indexedDB.deleteDatabase( dbName );
                
                req.onsuccess = function () {
                    done = true;
                };
                
                req.onerror = function () {
                    console.log( 'error deleting db' , arguments );
                };
                
                req.onblocked = function () {
                    console.log( 'db blocked on delete' , arguments );
                };
            });
            
            waitsFor( function () {
                 return done;
            }, 'timed out deleting the database', 1000);
        });
        
        afterEach( function () {
            runs( function () {
                if ( server ) {
                    server.close();
                    server = undefined;
                }
            });
        });
        
        it( 'should open a new instance successfully' , function () {
            runs( function () {
                db.open( dbName , 1 , function ( s ) {
                    server = s;
                } , { 
                    test: {
                        key: {
                            keyPath: 'id',
                            autoIncrement: true
                        }
                    }
                });
            });
            
            waitsFor( function () { 
                return !!server;
            } , 'wait on db' , 500 );
            
            runs( function () {
               expect( server ).toBeDefined(); 
            });
        });
        
        it( 'should use the provided schema' , function () {
            var done = false;

            runs( function () {
                db.open( dbName , 1 , function ( s ) {
                        server = s;
                    } , { 
                    test: {
                        key: {
                            keyPath: 'id',
                            autoIncrement: true
                        }
                    }
                });
            });
            
            waitsFor( function () { 
                return !!server;
            } , 'wait on db' , 500 );
            
            runs( function () {
                var req = indexedDB.open( dbName );
                req.onsuccess = function ( e ) {
                    var db = e.target.result;
                    
                    expect( db.objectStoreNames.length ).toEqual( 1 );
                    expect( db.objectStoreNames[ 0 ] ).toEqual( 'test' );
                    
                    db.close();
                    done = true;
                };
            });
            
            waitsFor( function () {
                return done;
            } , 'timed out on expectations' , 1000 );
        });
    });
})( window.db , window.describe , window.it , window.runs , window.expect , window.waitsFor , window.beforeEach , window.afterEach );