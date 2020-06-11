//BUDGET CONTROLLER
var budgetController=(function(){
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }
    Expense.prototype.calPercentage=function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
    };
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }
    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum+=cur.value;
        });
        data.totals[type]=sum;
    };

    var data={ 
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };
    return{
        addItem:function(type,des,val){
            var newItem,ID;
            if(data.allItems[type].length>0){
            ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }else{
                ID=0;
            }

            if(type==='exp'){
                newItem=new Expense(ID,des,val);
            }else if(type==="inc"){
                newItem=new Income(ID,des,val);
            }
            data.allItems[type].push(newItem);

            return newItem;

        },
        deleteItem:function(type,id){
            var ids,index;

             ids=data.allItems[type].map(function(current){
                return current.id;
            });

            index=ids.indexOf(id);

            if(index!==-1){
                data.allItems[type].splice(index,1);
            }

        },
        calculateBudget:function(){
           calculateTotal('exp');
           calculateTotal('inc');
           
           data.budget= data.totals.inc - data.totals.exp;
           if(data.totals.inc>0){
                 data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
           }else{
               data.percentage=-1;
           }
           

        },
        calculatePercentages:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calPercentage(data.totals.inc);
            });
        },
        getPercentages:function(){
            var allPerc=data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
     
        getBudget:function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing:function(){
            console.log(data);
        }
    }
   
})();


//UI CONTROLLER
var uiController=(function(){
   
    var DOMstrings={
        inputData:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        addButton:'.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLable:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'

    }
    var formatNumber=function(num,type){
        var numSplit,int,dec,type;
        num=Math.abs(num);
        num=num.toFixed(2);

        numSplit=num.split('.');

        int=numSplit[0];

        if(int.length>3){
            int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);

        }

        dec=numSplit[1];

        return (type==='exp'?'-':'+')+' '+int+'.'+dec;


    };
    var nodeListForEach=function(list,callback){
        for(var i=0;i<list.length;i++){
            callback(list[i],i);
        }
    };
    return{
        getInput:function(){
            return{
                type:document.querySelector(DOMstrings.inputData).value,
                description:document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem:function(obj,type){
            var html,newHtml;
            //Create HTML string with placeholder text
            if(type==='inc'){
                element=DOMstrings.incomeContainer;
           html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>'
            }
            else if(type==='exp'){
                element=DOMstrings.expensesContainer;
           html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>'
            }
            
            //Replace the placeholder text with some actual data

            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
            newHtml=newHtml.replace('%description%',obj.description);


           //Insert the HTML into DOM

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },

        deleteListItem:function(selectorID){
            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields:function(){
            var fields;
            fields=document.querySelectorAll(DOMstrings.inputDescription+' ,'+DOMstrings.inputValue);

            fieldsArr=Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index,array) {
                current.value="";
            });
            fieldsArr[0].focus();

            
        },

        displayBudget:function(obj){
            var type;
            obj.budget>=0?type='inc':type='exp';
           
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLable).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');

            if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+' %';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent='--';
            }
            

        },
        displayPercentages:function(percentages){
            var fields =document.querySelectorAll(DOMstrings.expensesPercLabel);

            


            nodeListForEach(fields,function(current,index){
                if(percentages[index]>0){
                    current.textContent=percentages[index]+' %';
                }
                else{
                    current.textContent="---";
                }
            });
            
        },
        displayMonth:function(){
            var now,months,month,year;

            now=new Date();

            months=['January','February','March','April','May','June','July','August','September','October','November','December'];
            month=now.getMonth();

            year=now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent=months[month]+' '+year;

        },
        changedType:function(){
            var fields=document.querySelectorAll(
                DOMstrings.inputData+','+DOMstrings.inputDescription+','+DOMstrings.inputValue
            );
            nodeListForEach(fields,function(current){
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.addButton).classList.toggle('red');

        },
        
        getDomStrings:function(){
            return DOMstrings;
        }

    };

})();

//GLOBAL APP CONTROLLER

var globalController=(function(budgetCtrl,uiCtrl){
    var setUpEventListener=function(){
        var DOM=uiCtrl.getDomStrings();
        document.querySelector(DOM.addButton).addEventListener('click',ctrlAdd);

        document.addEventListener('keypress',function(event){
            if(event.keyCode===13 || event.which==13){
                ctrlAdd();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputData).addEventListener('change',uiCtrl.changedType);
 
    };

    
    var updateBudget=function(){
        //1.Calculate the budget
        budgetCtrl.calculateBudget();
        //2.Return the budget
        var budget=budgetCtrl.getBudget();
        //3. Display the Budget
        uiCtrl.displayBudget(budget);


    };
    var updatePercentages=function(){
        //1.Calculate the percentages
        budgetCtrl.calculatePercentages();
        //2.Read percentages from the the budget controller
        var percentages=budgetCtrl.getPercentages();
        //3.Update the UI with new percentages
        uiCtrl.displayPercentages(percentages);

    };
    
    var ctrlAdd=function(){
        //1.Get the field input data.
    var input=uiCtrl.getInput();

    if(input.description!="" && !isNaN(input.value) && input.value>0 ){
        //2.Add the item to the budget controller

        var newItem=budgetCtrl.addItem(input.type,input.description,input.value);

        //3.Add the item to the UI

        uiCtrl.addListItem(newItem,input.type);

        //4. Clear the fields
        uiCtrl.clearFields();

        //5.Update the budget
        updateBudget();

        updatePercentages();
    }
};


    
    var ctrlDeleteItem=function(event){
        var itemID,ID;
        
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);
        if(itemID){
            splitID=itemID.split('-');
            type=splitID[0];
            ID=parseInt(splitID[1]);
            
            //1.Delete the item from data structure
            budgetCtrl.deleteItem(type,ID);
            //2.Delete the item from UI
            uiCtrl.deleteListItem(itemID);
            //3.Update and show the new budget
            updateBudget();

            updatePercentages();
        }
        
    
    };
    return {
        init:function(){
            console.log("Application has started");
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp:0,
                percentage: -1
            });
            uiCtrl.displayMonth();
            setUpEventListener();
        }
    }

    

})(budgetController,uiController);
globalController.init();
