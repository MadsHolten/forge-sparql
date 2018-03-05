import { Injectable }   from '@angular/core';
import _ from 'lodash';

@Injectable()
export class ForgeViewerService {

    // Find URI by database ID
    public findURIbyDbId(dbids,viewer){
        return new Promise((resolve, reject) => {
            viewer.model.getBulkProperties(dbids, ['URI'], elements => resolve(elements), err => reject(err))
        });
    }

    // Find an element by searching for its URI
    public findElementByURI(URI,viewer){
        return new Promise((resolve, reject) => {
            viewer.search('"' + URI + '"', dbIDs => {
                //NB! Revit models don't have spaces
                
                // Just return the URI if it is not a room, space or level
                if(!URI.includes('Space') && !URI.includes('Room') && !URI.includes('Levels')) resolve(dbIDs);
                
                // Special case for rooms / spaces / levels
                else {
                // This is some workaround in order to return only elements. 
                // It is not the most correct approach and might break in the future
                    // var spaceID = _.filter(dbIDs, dbID => {
                    //     //What properties are present on the node?
                    //     this.getProperties(dbID,viewer).then(propData => {
                    //     var pd: any = _.clone(propData);
                    //     // Check if it is a room
                    //     var findit = pd.properties.filter(item => {
                    //         return (item.displayName === 'Type' 
                    //         && item.displayValue === 'Rooms'); 
                    //     });
                    //     if(findit.length > 0) resolve(dbID);
                    //     })
                    // })
                }
            }, err => {
                reject(err);
            })
        });
    }

    //Get properties by dbid
    public getProperties(dbid,viewer){
        return new Promise((resolve, reject) => {
            viewer.getProperties(dbid, res => resolve(res), err => reject(err))
        });
    }

}