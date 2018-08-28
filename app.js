var budgetController = (function () {
    var id, description, value, percentage;
    var Expense=function(id,description,value){
        this.id=id
        this.description=description
        this.value=value
        this.percentage=-1
    }
    Expense.prototype.calPercentage=function(inc){
        if(inc>0){
            this.percentage=(parseFloat(this.value)/inc)*100
        }
        else this.percentage=-1
    }
    Expense.prototype.getPercentage=function(){
        return this.percentage
    }
    var Income=function(id,description,value){
        this.id=id
        this.description=description,
        this.value=value
    }
    var calculateTotal=function(type){
        var amounts=data.allItems[type]
        var sum=0
        amounts.forEach(function(current){
            sum+=parseFloat(current.value)
        })
        data.totals[type]=sum
    }
    var data={
        allItems:{
            expense:[],
            income:[]
        },
        totals:{
            expense:0,
            income:0
        },
        budget:0,
        percentage:-1
    }
    return{
        addItem:function(type,description,value){
            var newItem,id
            id=data.allItems[type].length==0?0:data.allItems[type][data.allItems[type].length-1].id+1
            if(type==='expense'){
                newItem=new Expense(id,description,value)
            }
            else{
                newItem=new Income(id,description,value)
            }
            data.allItems[type].push(newItem)
            return newItem
        },
        viewData:function(){
            return console.log(data)
        },
        calculateBudget:function(){
            calculateTotal('expense')
            calculateTotal('income')
            data.budget=parseFloat(data.totals.income)-parseFloat(data.totals.expense)
            if(data.totals.income>0){
                data.percentage=(data.totals.expense/data.totals.income)*100    
            }
        },
        calculatePercentage:function(){
            data.allItems.expense.forEach(function(cur){
                cur.calPercentage(data.totals.income)
            })
        },
        getPercentages:function(){
            var percentages=data.allItems.expense.map(function(cal){
                return cal.percentage
            })
            return percentages
        },
        deleteItem:function(type,id){
            var ids=data.allItems[type].map(function(current){
                return current.id
            })
            var index=ids.indexOf(id)
            if(index!==-1){
                data.allItems[type].splice(index,1)
            }
        },
        getBudget:function(){
            return{
                budget:data.budget,
                percentage:data.percentage,
                income:data.totals.income,
                expense:data.totals.expense
            }
        }
        
    }
})()

var UIController=(function(){
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }

        dec = numSplit[1];

        return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
    }
    var nodeListForEach=function(list,callback){
        for(var i=0;i<list.length;i++){
            callback(list[i],i)
            }
    }
    
    return{
        getInput:function(){
            return{
                type: document.querySelector('.add__type').value,
                description: document.querySelector('.add__description').value,
                value: parseFloat(document.querySelector('.add__value').value).toFixed(2) 
            }
        },
        
        addListItem:function(item,type){
            var newhtml,html,element
            if(type==='expense'){
                element='.expenses__list'
                html='<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else{
                element='.income__list'
                html='<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            newhtml=html.replace('%id%',item.id)
            newhtml=newhtml.replace('%description%',item.description)            
            newhtml=newhtml.replace('%value%',formatNumber(item.value,type))
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml)
        },
        deleteListItem:function(id){
            el=document.getElementById(id)   
            el.parentElement.removeChild(el)
        },
        clearFeild:function(){
            var feilds,feildsArray
            feilds=document.querySelectorAll(".add__description,.add__value")
            feildsArray=Array.prototype.slice.call(feilds)
            feildsArray.forEach(function(current,index,array){
                current.value=""
            })
            feildsArray[0].focus()
        },
        displayBudget:function(obj){
            document.querySelector(".budget__value").textContent=formatNumber(obj.budget,obj.budget>=0?'income':'expense')
            document.querySelector(".budget__income--value").textContent=formatNumber(obj.income,'income')
            document.querySelector(".budget__expenses--value").textContent=formatNumber(obj.expense,'expense')
            if(parseFloat(obj.percentage)>0){
                document.querySelector(".budget__expenses--percentage").textContent=parseInt(obj.percentage).toString()+'%'
            }else{
                document.querySelector(".budget__expenses--percentage").textContent='---'
            }
        },
        displayPercentages:function(percentages){
            var feilds=document.querySelectorAll(".item__percentage")
            
            nodeListForEach(feilds,function(current,index){
                if(percentages[index]>0){
                    current.textContent=parseInt(percentages[index])+'%'
                }
                else current.textContent='---'
            })
        },
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(".budget__title--month").textContent = months[month] + ' ' + year;
        },
        changedType: function() {
            var fields = document.querySelectorAll(".add__type,.add__description,.add__value");
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus') 
            })
            
            document.querySelector(".add__btn").classList.toggle('red')
            
        }
    }
})()

var controller=(function(budgetCtlr,UICtlr){
    var setupEventListener=function(){
        document.querySelector('.add__btn').addEventListener('click',ctlrAddItem)
    
        document.addEventListener('keypress',function(event){
            if(event.keyCode===13 || event.which===13){
                ctlrAddItem()
            }
        })
        
        document.querySelector(".container").addEventListener('click',ctlrDeleteItem)
        document.querySelector(".add__type").addEventListener('change',UICtlr.changedType)
    }
    var updateBudget=function(){
        budgetCtlr.calculateBudget()
        var budget=budgetCtlr.getBudget()
        UICtlr.displayBudget(budget)
    }
    var updatepercentage=function(){
        budgetCtlr.calculatePercentage()
        var percerntages=budgetCtlr.getPercentages()
        UICtlr.displayPercentages(percerntages)
    }
    var ctlrAddItem=function(){
        var input=UICtlr.getInput()
        if(input.description!='' && !isNaN(input.value) && input.value>0){
            var newItem=budgetCtlr.addItem(input.type,input.description,input.value)
            UICtlr.addListItem(newItem,input.type)
            UICtlr.clearFeild()
            updateBudget()  
            updatepercentage()
        }
    }
    var ctlrDeleteItem=function(event){
        var itemId=event.target.parentNode.parentNode.parentNode.parentNode.id
        if(itemId){
            var split=itemId.split("-")
            var type=split[0]
            var id=parseInt(split[1])
            budgetCtlr.deleteItem(type,id)
            UICtlr.deleteListItem(itemId)
            budgetCtlr.calculateBudget()
            updateBudget()
            updatepercentage()
        }
    }
    return{
        init:function(){
            console.log("Application is running")
            UICtlr.displayMonth()
            UICtlr.displayBudget({
                budget:0,
                percentage:-1,
                income:0,
                expense:0
            })
            setupEventListener()
        }
    }
})(budgetController,UIController)

controller.init()