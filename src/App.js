import React, { Component } from 'react';
import Preview from './Components/Preview/Preview';
import Message from './Components/Message/Message';
import Notes from './Components/Notes/Notes';
import NotesList from './Components/Notes/NotesList';
import NoteForm from './Components/Notes/NoteForm';
import Note from './Components/Notes/Note';
import Alert from './Components/Alert/Alert';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notes: [],
            title: '',
            content: '',
            selectedNote: null,
            creating: false,
            editing: false,
            validation: [],
        }
    }

    componentWillMount() {
        if (localStorage.getItem('notes')) {
            this.setState({ notes: JSON.parse(localStorage.getItem('notes')) });

        }
        else {
            localStorage.setItem('notes', JSON.stringify([]));

        }
    }

    // Set time to remove alert validation after 3sec
    componentDidUpdate() {
        if (this.state.validation.length !== 0) {
            setTimeout(() => {
                this.setState({ validation: [] })
            }, 3000);
        }
    }


    // Validate Note data (title, content)
    validate() {
        const validationError = [];
        let passed = true;
        if (!this.state.title) {
            validationError.push("الرجاء ادخال عنوان الملاحظة ");
            passed = false;
        }
        if (!this.state.content) {
            validationError.push("الرجاء ادخال محتوي الملاحظة ");
            passed = false;
        }
        this.setState({ validation: validationError });
        return passed;
    }

    saveToLoacalStorage(name, value) {
        localStorage.setItem(name, JSON.stringify(value));
    }

    // On Add click listener.
    addNoteHandler = () => {
        this.setState({ creating: true, editing: false, title: '', content: '' });
    }

    // Handle title change event.
    changeTitleHandler = (event) => {
        this.setState({ title: event.target.value });

    }

    // Handle content change event.
    changeContentHandler = (event) => {
        this.setState({ content: event.target.value });
    }

    // On Save click listener.
    saveNoteHandler = () => {
        if (!this.validate()) return;
        const { title, content, notes } = this.state;
        const note = {
            id: new Date(),
            title: title,
            content: content
        };
        const updatedNotes = [...notes, note];
        this.saveToLoacalStorage('notes', updatedNotes);
        this.setState({ notes: updatedNotes, creating: false, selectedNote: note.id, title: '', content: '' });
    }

    // On Update click listener.
    updateNoteHandler = () => {
        if (!this.validate()) return;
        const { title, content, notes, selectedNote } = this.state;
        const UpdatedNotes = [...notes];
        const noteIndex = notes.findIndex(note => note.id === selectedNote);

        UpdatedNotes[noteIndex] = {
            id: selectedNote,
            title: title,
            content: content,
        }
        this.saveToLoacalStorage('notes', UpdatedNotes);

        this.setState({
            notes: UpdatedNotes,
            editing: false,
            title: '',
            content: ''
        })
    }

    // On delete click  listener.
    deleteNoteHandler = () => {
        const updateNotes = [...this.state.notes];
        const noteIndex = updateNotes.findIndex(note => note.id === this.state.selectedNote);
        updateNotes.splice(noteIndex, 1);
        this.saveToLoacalStorage('notes', updateNotes);
        this.setState({ notes: updateNotes, selectedNote: null });
    }

    selectNoteHandler = (noteId) => {
        this.setState({ selectedNote: noteId, creating: false, editing: false });
    }

    // Handle edit click  to edit selected note
    editNoteHandler = () => {
        const note = this.state.notes.filter(note => note.id === this.state.selectedNote)[0];
        this.setState({ editing: true, title: note.title, content: note.content });
    }

    // Open Note form to add new note to Notes list.
    getAddNote = () => {
        return (
            <NoteForm
                formTitle="ملاحظة جديدة"
                title={this.state.title}
                content={this.state.content}
                titleChanged={this.changeTitleHandler}
                contentChanged={this.changeContentHandler}
                submitText="حفظ"
                submitClicked={this.saveNoteHandler}
            />
        );
    }

    // Display Selected note.
    getPreview = () => {
        const { notes, selectedNote } = this.state;
        if (notes.length === 0) {
            return <Message title="لايوجد ملاحظات" />
        }
        if (!selectedNote) {
            return <Message title="الرجاء اختيار ملاحظة" />

        }
        const note = notes.filter(note => { return note.id === selectedNote })[0];
        let noteDisplay = (
            <div>
                <h2>{note.title}</h2>
                <p>{note.content}</p>
            </div>
        );
        if (this.state.editing) {
            noteDisplay = (
                <NoteForm
                    formTitle="تعديل ملاحظة"
                    title={this.state.title}
                    content={this.state.content}
                    titleChanged={this.changeTitleHandler}
                    contentChanged={this.changeContentHandler}
                    submitText="تعديل"
                    submitClicked={this.updateNoteHandler}
                />
            )
        }
        return (
            <div>
                {!this.state.editing &&
                    <div className="note-operations">
                        <a href="#" onClick={this.editNoteHandler}><i className="fa fa-pencil-alt" /></a>
                        <a href="#" onClick={this.deleteNoteHandler}><i className="fa fa-trash" /></a>
                    </div>
                }

                {noteDisplay}
            </div>
        );
    };

    render() {
        return (
            <div className="App">
                <Notes>
                    <NotesList>
                        {this.state.notes.map(note =>
                            <Note
                                key={note.id}
                                title={note.title}
                                noteClicked={() => this.selectNoteHandler(note.id)}
                                active={this.state.selectedNote === note.id}
                            />
                        )}

                    </NotesList>
                    <button className="add-btn" onClick={this.addNoteHandler}>
                        +
                    </button>
                </Notes>
                <Preview>
                    {this.state.creating ? this.getAddNote() : this.getPreview()}
                </Preview>
                {this.state.validation.length !== 0 && <Alert validationMessages={this.state.validation} />}

            </div>
        );
    }
}

export default App;
