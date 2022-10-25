import { Component } from 'react';

import AppInfo from '../app-info/app-info';
import SearchPanel from '../search-panel/search-panel';
import AppFilter from '../app-filter/app-filter';
import EmployeesList from '../employees-list/employees-list';
import EmployeesAddForm from '../employees-add-form/employees-add-form';

import {getFirestore} from "firebase/firestore";
import { collection, doc, query, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { app } from "../../firebase-config"

import './app.css';

const db = getFirestore(app);

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            term: '',
            filter: 'all'
        }
        this.maxId = 4;
    }

    async componentDidMount()  {
        const empl = [];
        const emplList = await getDocs(collection(db, "employees"));
        emplList.forEach((doc) => {
            const docData = doc.data();
            empl.push({
                id: doc.id,
                name: docData.name,
                salary: docData.salary ,
                increase: docData.increase ,
                rise: docData.rise })
        });
        this.setState(({data}) => {
            return {
                data: empl
            }
        });
    }

    async deleteItem(idToBeDeleted) {
        const e = query(collection(db,'employees'));
        const employees = await getDocs(e);

        for(let item of employees.docs){
            if(item.id === idToBeDeleted) {
                await deleteDoc(doc(db, 'employees', item.id));
            }
        }
        return {
            data: employees
        }
    }

    async addItem() {
        await addDoc(collection(db, 'employees'),{
            name: 'Anastasia',
            salary: 2000,
            increase: false,
            rise: false
        }).then((docRef) => {
            return {
                data: docRef.id
            }
        });
    }

    onToggleProp = (id, prop) => {
        this.setState(({data}) => ({
            data: data.map(item => {
                if (item.id === id) {
                    return {...item, [prop]: !item[prop]}
                }
                return item;
            })
        }))
    }

    searchEmp = (items, term) => {
        if (term.length === 0) {
            return items;
        }

        return items.filter(item => {
            return item.name.indexOf(term) > -1
        })
    }

    onUpdateSearch = (term) => {
        this.setState({term});
    }

    filterPost = (items, filter) => {
        switch (filter) {
            case 'rise':
                return items.filter(item => item.rise);
            case 'moreThen1000':
                return items.filter(item => item.salary > 1000);
            default:
                return items
        }
    }

    onFilterSelect = (filter) => {
        this.setState({filter});
    }

    render() {
        const {data, term, filter} = this.state;
        const employees = this.state.data.length;
        const increased = this.state.data.filter(item => item.increase).length;
        const visibleData = this.filterPost(this.searchEmp(data, term), filter);

        return (
            <div className="app">
                <AppInfo employees={employees} increased={increased}/>

                <div className="search-panel">
                    <SearchPanel onUpdateSearch={this.onUpdateSearch}/>
                    <AppFilter filter={filter} onFilterSelect={this.onFilterSelect}/>
                </div>

                <EmployeesList
                    data={visibleData}
                    onDelete={this.deleteItem}
                    onToggleProp={this.onToggleProp}/>
                <EmployeesAddForm onAdd={this.addItem}/>
            </div>
        );
    }
}

export default App;