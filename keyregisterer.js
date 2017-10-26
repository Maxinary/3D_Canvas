let buttonMove = {down:0, up:1, hold:2, notHold:3};

class KeyRegister{
  constructor(){
    this.upFunctions = {};
    this.downFunctions = {};
    this.holdFunctions = {};
    this.notHoldFunctions = {};
    this.keys = {};
  }
  
  registerKeyPress(btnMove, buttonID, funct){
    this.keys[buttonID.toString()] = -1;
    switch(btnMove){
      
      case buttonMove.down:
        if(this.downFunctions[buttonID.toString()]===undefined){
          this.downFunctions[buttonID.toString()] = [];
        }
        this.downFunctions[buttonID.toString()].push(funct);
        break;

      case buttonMove.up:
        if(this.upFunctions[buttonID.toString()]===undefined){
          this.upFunctions[buttonID.toString()] = [];
        }
        this.upFunctions[buttonID.toString()].push(funct);
        break;
      
      case buttonMove.hold:
        if(this.holdFunctions[buttonID.toString()]===undefined){
          this.holdFunctions[buttonID.toString()] = [];
        }
        this.holdFunctions[buttonID.toString()].push(funct);
        break;
      case buttonMove.notHold:
        if(this.notHoldFunctions[buttonID.toString()]===undefined){
          this.notHoldFunctions[buttonID.toString()] = [];
        }
        this.notHoldFunctions[buttonID.toString()].push(funct);
        break;
    }
  }
  
  engage(){
    document.onkeydown = function(thisKeyReg){
      return function(e){
        if(thisKeyReg.keys[e.keyCode.toString()] < 1){
          thisKeyReg.keys[e.keyCode.toString()] = 1;
        }
      };
    }(this);
    
    document.onkeyup = function(thisKeyReg){
      return function(e){
        thisKeyReg.keys[e.keyCode.toString()] = 0;
      };
    }(this);
  }
  
  clearState(){
    for(var i in this.keys){
      this.keys[i] = -1;
    }
  }
  
  keyTick(){
    for(var i in this.keys){
      if(this.keys.hasOwnProperty(i)){
        if(this.keys[i] > 0){
          if(this.keys[i] == 1){//key down
            for(var j in this.downFunctions[i]){
              if(this.downFunctions[i].hasOwnProperty(j)){
                this.downFunctions[i][j]();
                this.keys[i]++;
              }
            }
          }
          
          //key hold
          for(var j in this.holdFunctions[i]){
            if(this.holdFunctions[i].hasOwnProperty(j)){
              this.holdFunctions[i][j]();
            }
          }
          
          
        }else if(this.keys[i] == 0){//key up
          for(var j in this.upFunctions[i]){
            if(this.upFunctions[i].hasOwnProperty(j)){
              this.upFunctions[i][j]();
              this.keys[i]--;
            }
          }
          
          for(var j in this.notHoldFunctions){
            if(this.notHoldFunctions[i].hasOwnProperty(j)){
              this.notHoldFunctions[i][j]();
            }
          }
        }
      }
    }
  }
}
