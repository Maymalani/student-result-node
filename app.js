var express = require('express');
var app = express();
var mysql = require('mysql')
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

var con = mysql.createConnection({
    database: process.env.DB,
    user: process.env.USER,
    host: process.env.HOST,
    password: process.env.PASSWORD
});

con.connect();

var adminLogin = 0;
var staffLogin = 0;
var studentLogin = 0;

app.get('/', (req, res) => {
    if (adminLogin == 0) {
        res.render('admin_login');
    } else {
        res.redirect('/admin');
    }
});

app.get('/admin_log_out', (req, res) => {
    adminLogin = 0;
    res.redirect('/');
})

app.post('/', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    var sel = "select * from admin where email = '" + email + "' and password = '" + password + "'";

    con.query(sel, (err, result, index) => {
        if (err) throw err;
        if (result.length == 1) {
            adminLogin = 1;
            res.redirect('/admin')
        } else {
            res.redirect('/')
        }
    })
});

app.get('/admin', (req, res) => {
    if (adminLogin == 1) {
        res.render('admin');
    } else {
        res.redirect('/');
    }
})

app.get('/add_staff', (req, res) => {
    res.render('add_staff');
});

app.post('/add_staff', (req, res) => {
    var name = req.body.staffName;
    var email = req.body.staffEmail;
    var password = req.body.staffPassword;

    var ins = "insert into staff(staffName,staffEmail,staffPassword) values('" + name + "' , '" + email + "' , '" + password + "')";

    con.query(ins, (err, result, index) => {
        if (err) throw err;
        res.redirect('/admin');
    })

});

app.get('/add_std', (req, res) => {
    res.render('add_std');
})

app.post('/add_std', (req, res) => {
    var std = req.body.std;

    var ins = "insert into standard(std) values('" + std + "')";
    con.query(ins, (err, result, ind) => {
        if (err) throw err;
        res.redirect('/admin')
    })
})

app.get('/view_staff', (req, res) => {
    var sel = "select * from staff";

    con.query(sel, (err, result, index) => {
        if (err) throw err;
        res.render('view_staff', { result });

    })
});

app.get('/add_div', (req, res) => {
    res.render('add_div');
});

app.post('/add_div', (req, res) => {
    var div = req.body.div;

    var ins = "insert into division(division) values('" + div + "')";

    con.query(ins, (err, result, ind) => {
        if (err) throw err;
        res.redirect('/admin');
    })
});

app.get('/add_student', (req, res) => {
    var divi = "select * from division";
    var std = "select * from standard";

    con.query(divi, (err, diviResult, index) => {
        if (err) throw err;
        con.query(std, (err, stdResult, index) => {
            if (err) throw err;
            res.render('add_student', { diviResult, stdResult })
        })
    })
});

app.post('/add_student', (req, res) => {
    var { studentName, studentEmail, studentPassword, std, div, studentRollNumber } = req.body;

    var ins = "insert into student(student_name,student_email,student_password,student_std,student_div,student_roll_number) values('" + studentName + "','" + studentEmail + "','" + studentPassword + "','" + std + "','" + div + "','" + studentRollNumber + "')";

    con.query(ins, (err, result, ind) => {
        if (err) throw err;
        res.redirect('/admin');
    });
});

app.get('/assign_staff_div_wise', (req, res) => {
    var div = "select * from division";
    var std = "select * from standard";
    var staff = "select * from staff where staff_assign_status = 0";

    con.query(div, (err, divResult, index) => {
        if (err) throw err;
        con.query(std, (err, stdResult, index) => {
            if (err) throw err;
            con.query(staff, (err, staffResult, index) => {
                res.render('assign_staff', { divResult, stdResult, staffResult });
            })
        })
    })
});

app.post('/assign_staff_div_wise', (req, res) => {
    var staff_id = req.body.staff_id;
    var std = req.body.std;
    var div = req.body.div;

    var upd = "update staff set division = '" + div + "' , std = '" + std + "',staff_assign_status = 1 where id = '" + staff_id + "'";
    con.query(upd, (err, result, index) => {
        if (err) throw err;
        res.redirect('/admin')
    })
});

app.get('/view_student', (req, res) => {
    var sel = "select * from student";
    con.query(sel, (err, result, index) => {
        if (err) throw err;
        res.render('view_student', { result });
    })
});

app.get('/view_student_std_and_div_wise', (req, res) => {
    var stdSel = "select * from standard";
    var divSel = "select * from division";

    con.query(stdSel, (err, result, index) => {
        if (err) throw err;
        con.query(divSel,(err,divResult,index) => {
            if(err) throw err;
            res.render('view_student_std_and_div_wise', { result , divResult });
        })
    })
});

app.post('/view_student_std_and_div_wise', (req, res) => {
    var { std , div } = req.body;
    var sel = "select * from student where student_std = '"+std+"' and student_div = '"+div+"'";
    con.query(sel,(err,result,index) => {
        if(err) throw err;
        res.render('view_student_stdDiv',{result});
    })
});

app.get('/view_result_all_student', (req, res) => {
    var sel = "select * from result";
    
    con.query(sel,(err,result,ind) => {
        if(err) throw err;
        res.render('view_result_all_student',{result});
    })
})

app.get('/all_student_top_3_std_div', (req, res) => {
    var stdSel = "select * from standard";
    var divSel = "select * from division";

    con.query(stdSel, (err, result, index) => {
        if (err) throw err;
        con.query(divSel,(err,divResult,index) => {
            if(err) throw err;
            res.render('all_student_top_3_std_div', { result , divResult });
        })
    })   
});

app.post("/all_student_top_3_std_div",(req,res) => {
    var { std , div } = req.body;
    var sel = "select * from result where std = '"+std+"' and division = '"+div+"'";
    con.query(sel,(err,result,index) => {
        if(err) throw err;
        res.render('all_student_top_3_std_div_result',{result});
    })
})

app.get('/view_all_fail_student', (req, res) => {
    var sel = "select * from result where result = 'fail'";
    con.query(sel,(err,result,index) => {
        if(err) throw err;
        res.render('view_all_fail_student',{result});
    })
})

app.get('/staff_login', (req, res) => {
    res.render('staff_login');
});

app.post('/staff_login', (req, res) => {
    var email = req.body.staffEmail;
    var password = req.body.staffPassword;

    var sel = "select * from staff where staffEmail = '" + email + "' and staffPassword = '" + password + "' ";

    con.query(sel, (err, result, index) => {
        if (err) throw err;
        if (result.length == 1) {
            staffLogin = 1;
            localStorage.setItem('studentStd', result[0].std);
            localStorage.setItem('studentDiv', result[0].division);
            res.redirect('/staff');
        }
    })
});

app.get('/staff', (req, res) => {
    if (staffLogin == 1) {
        res.render('staff');
    } else {
        res.redirect('/staff_login')
    }
});

app.get("/staff_log_out", (req, res) => {
    staffLogin = 0;
    res.redirect('/staff_login')
});

app.get('/staff_view_student', (req, res) => {
    var Std = localStorage.getItem('studentStd');
    var Div = localStorage.getItem('studentDiv');
    var sel = "select * from student where student_std = '" + Std + "' and student_div = '" + Div + "'";
    con.query(sel, (err, result, index) => {
        if (err) throw err;
        res.render('staff_view_student', { result })
    })
});

app.get('/add_result', (req, res) => {
    var Std = localStorage.getItem('studentStd');
    var Div = localStorage.getItem('studentDiv');
    var sel = "select * from student where student_std = '" + Std + "' and student_div = '" + Div + "' and student_result_status = 0";
    con.query(sel, (err, result, index) => {
        if (err) throw err;
        res.render('add_result', { result })
    })
});

app.post('/add_result', (req, res) => {
    var { student, std, div, s1, s2, s3, s4, s5 } = req.body;
    var total = Number(s1) + Number(s2) + Number(s3) + Number(s4) + Number(s5);
    var avg = total / 5;
    var result;
    if (avg >= 35) {
        result = 'Pass';
    } else {
        result = 'Fail';
    }

    var ins = "insert into result(student_name,std,division,s1,s2,s3,s4,s5,total,avg,result) values('" + student + "','" + std + "','" + div + "','" + s1 + "','" + s2 + "','" + s3 + "','" + s4 + "','" + s5 + "','" + total + "','" + avg + "','" + result + "')";
    var upd = "update student set student_result_status = 1 where student_name = '"+student+"'";

    con.query(ins, (err, result, index) => {
        if (err) throw err;
        con.query(upd,(err,result,index) => {
            res.redirect('/staff');
        })
    })
})

app.get('/top3_view', (req, res) => {
    var Std = localStorage.getItem('studentStd');
    var Div = localStorage.getItem('studentDiv');
    var sel = "select * from result where std = '"+Std+"' and division = '"+Div+"' order by avg desc limit 3";
    con.query(sel,(err,result,index) => {
        if(err) throw err;
        res.render('top3_view',{result});
    })
});

app.get('/transfer_student',(req,res) => {
    var Std = localStorage.getItem('studentStd');
    var Div = localStorage.getItem('studentDiv');
    var sel = "select * from student where student_std = '"+Std+"' and student_div = '"+Div+"' and student_result_status = 1";
    var stdSel = "select * from standard where std > '"+Std+"'";
    var divSel = "select * from division"
    con.query(sel,(err,result,index) => {
        if(err) throw err;
        con.query(stdSel,(err,stdResult,index) => {
            if(err) throw err;
            con.query(divSel,(err,divResult,index) => {
                if(err) throw err;
                res.render('transfer_student',{result,stdResult,divResult});
            })
        })
    })

});

app.post('/transfer_student',(req,res) => {
    var { trans_student , trans_student_std , trans_student_div } = req.body;
    var upd = "update student set student_std = '"+trans_student_std+"',student_div = '"+trans_student_div+"' where id = '"+trans_student+"'";
    con.query(upd,(err,result,index) => {
        if(err) throw err;
        res.redirect('/staff');
    })
});

app.get('/student_login',(req,res) => {
    res.render('student_login')
});

app.post('/student_login',(req,res) => {
    var { studentEmail , studentPassword } = req.body;
    var sel = "select * from student where student_email = '"+studentEmail+"' and student_password = '"+studentPassword+"'";
    con.query(sel,(err,result,index) => {
        if(err) throw err;
        if(result.length == 1){
            staffLogin = 1;
            res.render('student',{result})
        }else{
            res.redirect('/student_login')
        }
    })
});

app.get('/student_logout',(req,res) => {
    studentLogin = 0;
    res.redirect('/student_login')
})

app.get('/student',(req,res) => {
    if(studentLogin == 1){
        res.render('student');
    }else{
        res.redirect('/student_login');
    }
});

app.get('/student_view_result/:name/:std/:div',(req,res) => {
    var { name , std , div } = req.params;
    var sel = "select * from result where student_name = '"+name+"' and std = '"+std+"' and division = '"+div+"'";
    con.query(sel,(err,result,index) => {
        if(err) throw err;
        res.render('student_view_result',{result});
    })

})

app.listen(port);